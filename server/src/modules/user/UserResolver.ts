import {
  Arg,
  Resolver,
  Query,
  Authorized,
  Mutation,
  Ctx,
  ID,
  InputType,
  Field
} from "type-graphql";
import { Context } from "../common/context";
import { UserService } from "./UserService";
import { User, Profile } from "./UserEntity";
import "./enums";
import { accountsPassword } from "./accounts";
import { Role } from "./consts";

@InputType()
class ProfileInput implements Partial<Profile> {
  @Field(_type => String)
  firstName!: string;

  @Field(_type => String)
  lastName!: string;
}

@InputType()
class CreateUserInput implements Partial<User> {
  @Field(_type => String)
  email!: string;

  @Field(_type => String)
  password!: string;

  @Field(_type => ProfileInput)
  profile!: ProfileInput;
}

@InputType()
export class PropertyInput {
  @Field(_type => String)
  address!: string;

  @Field(_type => String)
  placeId!: string;

  @Field(_type => Number)
  rentAmount!: number;
}

@Resolver(User)
export default class UserResolver {
  private readonly service: UserService;

  constructor() {
    this.service = new UserService();
  }

  @Query(_returns => User)
  @Authorized()
  async me(@Ctx() ctx: Context) {
    if (ctx.userId) {
      return await this.service.findOneById(ctx.userId);
    }
    return null;
  }

  // this overrides accounts js `createUser` function
  @Mutation(_returns => ID)
  async createUser(
    @Arg("user", _returns => CreateUserInput) user: CreateUserInput
  ) {
    const createdUserId = await accountsPassword.createUser({
      ...user,
      roles: [Role.User]
    });

    return createdUserId;
  }

  @Mutation(_returns => Boolean)
  @Authorized()
  async onboardUser(
    @Arg("publicToken") _publicToken: string,
    @Arg("property") _property: PropertyInput,
    @Ctx() _ctx: Context
  ) {
    return new Promise((_resolve, _reject) => {});
  }

  // @FieldResolver(returns => String)
  // async firstName(@Root() user: User) {
  //   return user.profile.firstName;
  // }

  // @FieldResolver(returns => String)
  // async lastName(@Root() user: User) {
  //   return user.profile.lastName;
  // }
}
