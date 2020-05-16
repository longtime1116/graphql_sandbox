import React, { Component, Fragment } from "react";
import Users from "./Users";
import AuthorizedUser from "./AuthorizedUser";
import Photos from "./Photos";
import PostPhoto from "./PostPhoto";
import { BrowserRouter, Switch, Route } from "react-router-dom";
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
    allPhotos {
      id
      name
      url
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

class App extends Component {
  componentDidMount() {
    let { client } = this.props;
    this.listenForUsers = client
      .subscribe({ query: LISTEN_FOR_USERS })
      .subscribe(({ data: { newUser } }) => {
        const data = { ...client.readQuery({ query: ROOT_QUERY }) };
        data.totalUsers += 1;
        data.allUsers = [...data.allUsers, newUser];
        client.writeQuery({ query: ROOT_QUERY, data });
      });
  }
  componentWillUnmount() {
    this.listenForUsers.unsubscribe();
  }
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            component={() => (
              <Fragment>
                <AuthorizedUser />
                <Users />
                <Photos />
              </Fragment>
            )}
          />
          <Route path="/newPhoto" component={PostPhoto} />
          <Route
            component={({ location }) => <h1>{location.pathname} not found</h1>}
          />
        </Switch>
        <div></div>
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
