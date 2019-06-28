import Layout from "../components/MyLayout";
import fetch from "isomorphic-unfetch";


const Post = (props: any) => (
    <Layout>
        <h1>{props.show.name}</h1>
        <p>{props.show.summary.replace(/<[/]?p>/g, '')}</p>
        <img src={props.show.image.medium} />
    </Layout>
);

Post.getInitialProps = async (context: any) => {
    const { id } = context.query;
    console.log(`https://api.tvmaze.com/shows/${id}`);
    const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
    const show = await res.json();
    console.log(`Fetched show: ${show.name}`);
    return { show };
}

export default Post;