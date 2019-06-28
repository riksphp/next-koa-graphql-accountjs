import Layout from "../components/MyLayout";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import { useQuery } from 'react-apollo-hooks';
import gql from "graphql-tag";
import JsonLogger from "../utils/logger/JsonLogger";

export const GET_HELLO = gql`
    {
        hello
    }
`;

// @ts-ignore
const ShowLink = ({ show }) => (
    <li>
        <Link href={`/post?id=${show.id}`} as={`/p/${show.id}`} prefetch>
            <a>{show.name}</a>
        </Link>
    </li>
);

const Greeting = () => {
    // @ts-ignore
    const { data: { hello }, error, loading } = useQuery(GET_HELLO);
    if (loading) {
        return <div>Loading...</div>;
    };
    if (error) {
        return <div>Error! {error.message}</div>;
    };

    return (
        <p>{hello}</p>
    );
}


const Index = (props: any) => (
    <Layout>
        <h1>Batman TV Shows</h1>
        <Greeting />
        <ul>
            {props.shows.map((show: any) => (
                <ShowLink key={show.id} show={show} />
            ))}
        </ul>
    </Layout>
);

Index.getInitialProps = async () => {
    const res = await fetch("https://api.tvmaze.com/search/shows?q=bat");
    const data = await res.json();
    JsonLogger.info(`Show data fetched. Count: ${data.length}`);
    return {
        shows: data.map((entry: any) => entry.show)
    };
};

export default Index;