import React, { Component } from "react";
import Users from "./Users";
import AuthorizedUser from "./AuthorizedUser";
import { BrowserRouter } from "react-router-dom";
import { gql } from "apollo-boost";
import { withApollo } from "react-apollo";
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

const LISTEN_FOR_USERS = gql`
  subscription {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`;

//const App = () => <Users />;
class App extends Component {
  componentDidMount() {
    let { client } = this.props;
    this.listenForUsers = client
      .subscribe({ query: LISTEN_FOR_USERS })
      .subscribe(({ data: { newUser } }) => {
        console.log("subscribe event...");
        const data = client.readQuery({ query: ROOT_QUERY });
        console.log(data.totalUsers);
        data.totalUsers += 1;
        data.allUsers = [...data.allUsers, newUser];
        // FIXME: writeQuery しても components が update されない問題・・・
        client.writeQuery({ query: ROOT_QUERY, data });
        //const data2 = client.readQuery({ query: ROOT_QUERY });
        //console.log(data2.totalUsers);
      });
  }
  componentWillUnmount() {
    this.listenForUsers.unsubscribe();
  }
  render() {
    return (
      <BrowserRouter>
        <div>
          <AuthorizedUser />
          <Users />
        </div>
      </BrowserRouter>
    );
  }
}

// App から client を呼び出せるように
export default withApollo(App);

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
