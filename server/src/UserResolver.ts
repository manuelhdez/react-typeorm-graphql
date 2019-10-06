import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "./entity/User";
import { hash } from "bcryptjs";

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hiiii";
  }

  @Query(() => [User])
  async users() {
    return await User.find();
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
