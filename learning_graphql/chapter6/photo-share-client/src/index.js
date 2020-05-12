import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ApolloProvider } from "react-apollo";
import {
  InMemoryCache,
  HttpLink,
  ApolloLink,
  ApolloClient,
  split,
} from "apollo-boost";
import { persistCache } from "apollo-cache-persist";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

const cache = new InMemoryCache();
persistCache({
  cache,
  storage: localStorage,
});

//console.log(localStorage["apollo-cache-persist"]);
if (localStorage["apollo-cache-persist"]) {
  let cacheData = JSON.parse(localStorage["apollo-cache-persist"]);
  cache.restore(cacheData);
}

const httpLink = new HttpLink({ uri: "http://localhost:4000/graphql" });
const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: { reconnect: true },
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext((context) => ({
    headers: {
      ...context.headers,
      authorization: localStorage.getItem("token"),
    },
  }));
  return forward(operation);
});
// http 通信をするときに authLink で authorization 情報を付与して実行できるようにする
const httpAuthLink = authLink.concat(httpLink);

// 第1引数に関数、trueならば第2引数を使い、falseならば第3引数を使う
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpAuthLink
);

const client = new ApolloClient({ cache, link });
ReactDOM.render(
  <ApolloProvider client={client}>
    {console.log(process.env)}
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// NOTE: try to use ApolloClient only
//import ApolloClient, { gql } from "apollo-boost";
//
//const client = new ApolloClient({ uri: "http://localhost:4000/graphql" });
//const query = gql`
//  {
//    totalUsers
//    totalPhotos
//  }
//`;
//client
//  .query({ query })
//  .then(({ data }) => console.log("data", data))
//  //.then(() => console.log("cache", client.extract()))
//  .catch((error) => console.log(error));
//
