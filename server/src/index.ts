import Koa from "koa";
import Router from "koa-router";
import next from "next";
import { KoaReqLogger } from "koa-req-logger";
import { ApolloServer, gql, PlaygroundConfig, makeExecutableSchema } from "apollo-server-koa";
import { join } from "path";
import 'reflect-metadata'
import { connect } from 'mongoose'
import { buildSchema } from 'type-graphql'
import { mergeResolvers, mergeTypeDefs, mergeSchemas } from 'graphql-toolkit'
import UserResolver from './modules/user/UserResolver'
import { authChecker } from './modules/user/authChecker'
import { setUpAccounts } from './modules/user/accounts'
import { TypegooseMiddleware } from "./middleware/typegoose";

const port = parseInt(process.env.port || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

// Initialize nextjs
const app = next({ dir: "./client", dev });
const handle = app.getRequestHandler();

// TODO: move this to a separate place
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type helloquery {
        hello: String
    }
`;
// Provide resolver functions for your schema fields
const resolvers = {
    helloquery: {
        hello: () => "Hello from graphQL!"
    }
};

const playground: PlaygroundConfig = {
    endpoint: "/graphql"
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

        const mongooseConnection = await connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/ops-master-web",
            { useNewUrlParser: true }
        );
        const { accountsGraphQL } = setUpAccounts(mongooseConnection.connection);

        const typeGraphqlSchema = await buildSchema({
            resolvers: [UserResolver],
            globalMiddlewares: [TypegooseMiddleware],
            // scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
            validate: false,
            emitSchemaFile: true,
            authChecker,
        });

        // @ts-ignore
        const schema = makeExecutableSchema({
            typeDefs: mergeTypeDefs([typeDefs, accountsGraphQL.typeDefs]),
            resolvers: mergeResolvers([resolvers, accountsGraphQL.resolvers]),
            // @ts-ignore
            schemaDirectives: {
                ...accountsGraphQL.schemaDirectives
            },
        });

        const graphQLServer = new ApolloServer({
            schema: mergeSchemas({
                schemas: [schema, typeGraphqlSchema],
            }),
            context: accountsGraphQL.context,
            formatError: error => {
                console.error(error)
                return error
            },
            playground
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

        await server.listen({ port  })
        console.log(`🚀 Server ready at localhost:${port}`)
        console.log(`🚀 GraphQL on http://localhost:${port}${graphQLServer.graphqlPath}`);
    } catch (e) {
        console.error(e.stack);
        process.exit(1);
    }
};

startServer();
