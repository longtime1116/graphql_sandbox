//import { ApolloServer } from "apollo-server";
const { ApolloServer, PubSub } = require(`apollo-server-express`);
const { createServer } = require("http");
const express = require(`express`);
const expressPlayground = require(`graphql-playground-middleware-express`)
  .default;
const { readFileSync } = require(`fs`);
const { MongoClient } = require(`mongodb`);
const path = require("path");
require(`dotenv`).config();

const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");
const resolvers = require("./resolvers");

//console.log(process.env.DB_HOST)

async function start() {
  var app = express();
  const MONGO_DB = process.env.DB_HOST;
  console.log("db connect start...");
  const client = await MongoClient.connect(MONGO_DB, {
    useUnifiedTopology: true,
  });
  console.log("db connect finished!");
  const db = client.db();

  const pubsub = new PubSub();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req && req.headers.authorization;
      const currentUser = await db.collection("users").findOne({ githubToken });
      return { db, currentUser, pubsub };
    },
  });

  app.use(
    "/img/photos",
    express.static(path.join(__dirname, "assets", "photos"))
  );

  server.applyMiddleware({ app });
  app.get(`/`, (req, res) => res.end(`Welcom to the PhotoShare API.`));
  app.get(`/playground`, expressPlayground({ endpoint: `/graphql` }));

  const httpServer = createServer(app);
  // これによりws://localhost:4000/graphql でサブスクリプションを利用できるようになる
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen({ port: 4000 }, () => {
    console.log(
      `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
    );
  });
}

start();
