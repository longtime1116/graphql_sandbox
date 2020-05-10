import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";

const client = new ApolloClient({ uri: "http://localhost:4000/graphql" });
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
