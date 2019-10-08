import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware
} from "type-graphql";
import { User } from "./entity/User";
import { hash, compare } from "bcryptjs";
import { MyContext } from "./MyContext";
import { createRefreshToken, createAccessToken } from "./auth";
import { isAuth } from "./isAuthMiddleware";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hiiii";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    return `Your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  async users() {
    return await User.find();
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw Error("Could not find user");
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw Error("bad passsword");
    }

    res.cookie("jid", createRefreshToken(user), {
      httpOnly: true
    });

    return {
      accessToken: createAccessToken(user)
    };
  }

  @Mutation(() => Boolean)
  async resgister(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashed = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashed
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
