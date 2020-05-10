import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ApolloProvider } from "react-apollo";
import ApolloClient, { InMemoryCache } from "apollo-boost";
import { persistCache } from "apollo-cache-persist";

const cache = new InMemoryCache();
persistCache({
  cache,
  storage: localStorage,
});

console.log(localStorage["apollo-cache-persist"]);
if (localStorage["apollo-cache-persist"]) {
  let cacheData = JSON.parse(localStorage["apollo-cache-persist"]);
  cache.restore(cacheData);
}
const client = new ApolloClient({
  cache,
  uri: "http://localhost:4000/graphql",
  request: (operation) => {
    operation.setContext((context) => ({
      headers: {
        ...context.headers,
        authorization: localStorage.getItem("token"),
      },
    }));
  },
});
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
