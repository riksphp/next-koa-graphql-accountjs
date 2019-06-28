import { DefaultAppIProps, NextAppContext } from "next/app";
import React from "react";
import initApollo from "./initApollo";
import Head from "next/head";
import { getDataFromTree } from "react-apollo";
import { NormalizedCacheObject } from "apollo-boost";

const isBrowser = typeof window !== "undefined";

interface ApolloAppIProps extends DefaultAppIProps {
    apolloState: NormalizedCacheObject
}

export default (App: any) => {
    return class AppWithApollo extends React.Component<DefaultAppIProps> {
        apolloClient: any;
        static displayName = "withApollo(App)";

        static async getInitialProps(appContext: NextAppContext) {
            const { Component, router } = appContext;

            const appProps: Promise<DefaultAppIProps> = await App.getInitialProps(appContext);

            // Run all GraphQL queries in the component tree
            // and extract the resulting data
            const apollo = initApollo.getApolloClient({});
            if (!isBrowser) {
                try {
                // Run all GraphQL queries
                await getDataFromTree(
                    <App
                    {...appProps}
                    Component={Component}
                    router={router}
                    apolloClient={apollo}
                    />
                );
                } catch (error) {
                // Prevent Apollo Client GraphQL errors from crashing SSR.
                // Handle them in components via the data.error prop:
                // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
                console.error("Error while running `getDataFromTree`", error);
                }

                // getDataFromTree does not call componentWillUnmount
                // head side effect therefore need to be cleared manually
                Head.rewind();
            }

            // Extract query data from the Apollo store
            const apolloState = apollo.cache.extract();

            return {
                ...appProps,
                apolloState
            };
        }

        constructor(props: ApolloAppIProps) {
            super(props);
            this.apolloClient = initApollo.getApolloClient(props.apolloState);
        }

        render() {
            return <App {...this.props} apolloClient={this.apolloClient} />;
        }
    }
}