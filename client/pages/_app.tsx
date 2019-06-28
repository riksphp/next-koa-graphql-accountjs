import App, { Container, DefaultAppIProps } from "next/app";
import withApolloClient from "../lib/with-apollo-client";
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks";

interface ApolloAppIProps extends DefaultAppIProps {
    apolloClient: any
}

class opsMasterApp extends App<ApolloAppIProps> {
    render() {
        const { Component, pageProps, apolloClient } = this.props;

        return (
            <Container>
                <ApolloHooksProvider client={apolloClient}>
                    <Component {...pageProps} />
                </ApolloHooksProvider>
            </Container>
        );
    }
}

export default withApolloClient(opsMasterApp);