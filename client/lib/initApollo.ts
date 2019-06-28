import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    ApolloLink
  } from "apollo-boost";
  import { withClientState } from "apollo-link-state";
  import fetch from "isomorphic-unfetch";
  import { NormalizedCacheObject } from "apollo-cache-inmemory";
  
  export interface Global {
    document: Document;
    window: Window;
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  }
  declare var global: Global;
  
  class InitApollo {
    private isBrowser: boolean | undefined;
    private apolloClient: any;
  
    constructor() {
      this.isBrowser = typeof window !== "undefined";
      // Polyfill fetch() on the server (used by apollo-client)
      if (!this.isBrowser) {
        global.fetch = fetch;
      }
    }
  
    private create(initialState: NormalizedCacheObject) {
      const cache = new InMemoryCache().restore(initialState || {});
  
      const httpLink = new HttpLink({
        credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
        uri: "http://localhost:3000/graphql" // Server URL (must be absolute)
      });
  
      const stateLink = withClientState({
        cache,
        defaults: {
          isConnected: true
        },
        resolvers: {
          Mutation: {
            updateNetworkStatus: (_ : { _: any }, { isConnected }: {isConnected: any}, { cache }: { cache: any }) => {
              cache.writeData({ data: { isConnected } });
              return null;
            }
          }
        }
      });
  
      return new ApolloClient({
        cache,
        connectToDevTools: this.isBrowser,
        link: ApolloLink.from([stateLink, httpLink]),
        ssrMode: !this.isBrowser // Disables forceFetch on the server (so queries are only run once)
      });
    }
  
    getApolloClient(initialState: NormalizedCacheObject) {
      // Make sure to create a new client for every server-side request so that data
      // isn't shared between connections (which would be bad)
      if (!this.isBrowser) {
        return this.create(initialState);
      }
  
      // Reuse client on the client-side
      if (!this.apolloClient) {
        this.apolloClient = this.create(initialState);
      }
  
      return this.apolloClient;
    }
  }
  
  export default new InitApollo();