import Layout from "../components/MyLayout";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import { useQuery } from 'react-apollo-hooks';
import gql from "graphql-tag";
import JsonLogger from "../utils/logger/JsonLogger.js";

export const GET_HELLO = gql`
  {
    hello
  }
`;

const ShowLink = ({ show }) => (
  <li>
    <Link href={`/post?id=${show.id}`} as={`/p/${show.id}`} prefetch>
      <a>{show.name}</a>
    </Link>
    <style jsx>{`
      li {
        list-style: none;
        margin: 5px 0;
      }

      a {
        text-decoration: none;
        color: blue;
        font-family: "Arial";
      }

      a:hover {
        opacity: 0.6;
      }
    `}</style>
  </li>
);

const Greeting = () => {
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

const Index = props => (
  <Layout>
    <h1>Batman TV Shows</h1>
   <Greeting />
    <ul>
      {props.shows.map(show => (
        <ShowLink key={show.id} show={show} />
      ))}
    </ul>
    <style jsx>{`
      h1,
      a {
        font-family: "Arial";
      }

      ul {
        padding: 0;
      }
    `}</style>
  </Layout>
);

Index.getInitialProps = async () => {
  const res = await fetch("https://api.tvmaze.com/search/shows?q=bat");
  const data = await res.json();
  JsonLogger.info(`Show data fetched. Count: ${data.length}`);
  return {
    shows: data.map(entry => entry.show)
  };
};

export default Index;
