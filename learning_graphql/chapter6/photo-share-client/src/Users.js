import React from "react";
import { Query, Mutation } from "react-apollo";
import { ROOT_QUERY, ADD_FAKE_USERS_MUTATION } from "./App";

const Users = () => (
  // https://www.apollographql.com/docs/react/data/queries/#options
  <Query query={ROOT_QUERY}>
    {
      // https://www.apollographql.com/docs/react/data/queries/#result
      ({ data, loading, refetch }) =>
        loading ? (
          <p>loading users...</p>
        ) : (
          <UserList
            count={data.totalUsers}
            users={data.allUsers}
            refetchUsers={refetch}
          />
        )
    }
  </Query>
);

const UserList = ({ count, users, refetchUsers }) => (
  <div>
    <p> {count} Users</p>
    <button onClick={() => refetchUsers()}>Refetch Users</button>
    <Mutation
      mutation={ADD_FAKE_USERS_MUTATION}
      variables={{ count: 1 }}
      refetchQueries={refetchUsers}
    >
      {(addFakeUsers) => <button onClick={addFakeUsers}>Add Fake Users</button>}
    </Mutation>
    <ul>
      {users.map((user) => (
        <UserListItem
          key={user.githubLogin}
          name={user.name}
          avatar={user.avatar}
        />
      ))}
    </ul>
  </div>
);

const UserListItem = ({ name, avatar }) => (
  <li>
    <img src={avatar} width={48} height={48} alt="" />
    {name}
  </li>
);

export default Users;
