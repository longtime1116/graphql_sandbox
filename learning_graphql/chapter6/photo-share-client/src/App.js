import React from "react";
import Users from "./Users";
import AuthorizedUser from "./AuthorizedUser";
import { BrowserRouter } from "react-router-dom";
import { gql } from "apollo-boost";
//import logo from "./logo.svg";
//import "./App.css";

// TODO: fragment を複数の gql で共有したい
export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers {
      ...userInfo
    }
    me {
      ...userInfo
    }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`;
export const ADD_FAKE_USERS_MUTATION = gql`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin
      name
      avatar
    }
  }
`;
//const App = () => <Users />;
const App = () => (
  <BrowserRouter>
    <div>
      <AuthorizedUser />
      <Users />;
    </div>
  </BrowserRouter>
);

export default App;

//function App() {
//  return (
//    <div className="App">
//      <header className="App-header">
//        <img src={logo} className="App-logo" alt="logo" />
//        <p>
//          Edit <code>src/App.js</code> and save to reload.
//        </p>
//        <a
//          className="App-link"
//          href="https://reactjs.org"
//          target="_blank"
//          rel="noopener noreferrer"
//        >
//          Learn React
//        </a>
//      </header>
//    </div>
//  );
//}
