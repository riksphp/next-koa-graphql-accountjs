import { AccountsClient } from "@accounts/client";
import { AccountsClientPassword } from "@accounts/client-password";
import GraphQLClient from "@accounts/graphql-client";
import ApolloClient from "apollo-boost";

const apolloClient = new ApolloClient({
  headers: function createHeaders() {
    // tslint:disable-next-line:no-console
    console.log("arguments", arguments);
  },
  uri: process.env.GRAPHQL_SERVER || "http://localhost:4001/graphql"
});

const accountsGraphQL = new GraphQLClient({ graphQLClient: apolloClient });
const accountsClient = new AccountsClient({}, accountsGraphQL);
const accountsPassword = new AccountsClientPassword(accountsClient);

export { accountsClient, accountsGraphQL, accountsPassword, apolloClient };
