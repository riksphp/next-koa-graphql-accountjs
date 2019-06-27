const Koa = require("koa");
const next = require("next");
const Router = require("koa-router");
const { KoaReqLogger } = require("koa-req-logger");
const { ApolloServer, gql } = require("apollo-server-koa");
const { join } = require("path");

const port = parseInt(process.env.port, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";

// Initialize nextjs
const app = next({ dir: "./client", dev });
const handle = app.getRequestHandler();

// TODO: move this to a separate place
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => "Hello from graphQL!"
  }
};
const playground = {
  enpoint: "/graphql"
};

const startServer = async () => {
  try {
    const server = new Koa();
    const router = new Router();
    const logger = new KoaReqLogger({
      pinoOptions: {
        name: "koa-apollo",
        level: "debug"
      }
    });
    const graphQLServer = new ApolloServer({
      typeDefs,
      resolvers,
      playground,
      bodyParser: true
    });
    graphQLServer.applyMiddleware({ app: server });

    await app.prepare();

    router.get("/p/:id", async ctx => {
      const actualPage = "/post";
      const queryParams = { id: ctx.params.id };
      await app.render(ctx.req, ctx.res, actualPage, queryParams);
      ctx.respond = false;
    });

    router.get("/service-worker.js", async ctx => {
      const pathname = await join(__dirname, ".next", "service-worker.js");
      ctx.body = await app.serveStatic(ctx.req, ctx.res, pathname);
      ctx.respond = true;
    });

    router.get("/healthcheck", async ctx => {
      ctx.body = "ok";
      ctx.respond = true;
    });

    router.get("*", async ctx => {
      if (!ctx.path.match(/graphql/)) {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
      }
    });

    server.use(async (ctx, next) => {
      ctx.res.statusCode = 200;
      await next();
    });

    server.use(logger.getMiddleware());
    server.use(router.routes());

    server.listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
      console.log(
        `> GraphQL on http://localhost:${port}${graphQLServer.graphqlPath}`
      );
    });
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
};

startServer();
