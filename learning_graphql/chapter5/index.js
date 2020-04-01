//import { ApolloServer } from "apollo-server";
const { ApolloServer } = require(`apollo-server`);
const { GraphQLScalarType } = require(`graphql`);

const typeDefs = `

enum PhotoCategory {
  SELFIE
  PORTRATE
  ACTION
  LANDSCAPE
  GRAPHIC
  OTHERS
}

scalar DateTime

type User {
  githubLoginID: ID!
  name: String
  avatar: String
  postedPhotos: [Photo!]!
  inPhotos: [Photo!]!
}

type Photo {
  id: ID!
  url: String!
  name: String!
  category: PhotoCategory!
  description: String
  postedBy: User!
  taggedUsers: [User!]!
  createdAt: DateTime!
}

input PostPhotoInput {
  name: String!
  category: PhotoCategory=OTHERS
  description: String
}

type Query {
    totalPhotos: Int!
    allUsers: [User!]!
    allPhotos: [Photo!]!
}
type Mutation {
  postPhoto(input: PostPhotoInput): Photo!
}
`;

var users = [
  {
    githubLoginID: "userA",
    name: "Alice"
  },
  {
    githubLoginID: "userB",
    name: "Bob"
  },
  {
    githubLoginID: "userC",
    name: "Chris"
  }
];

var photos = [
  {
    id: 1,
    name: "1_photo",
    description: "This is 1_photo",
    category: "SELFIE",
    githubUser: "userA",
    createdAt: "3-15-2020"
  },
  {
    id: 2,
    name: "2_photo",
    description: "This is 2_photo",
    category: "PORTRATE",
    githubUser: "userB",
    createdAt: "12-20-2019"
  },
  {
    id: 3,
    name: "3_photo",
    description: "This is 3_photo",
    category: "ACTION",
    githubUser: "userB",
    createdAt: "2020-04-01T15:36:11.308Z"
  }
];

var tags = [
  {
    photoID: 1,
    userID: "userA"
  },
  {
    photoID: 2,
    userID: "userB"
  },
  {
    photoID: 3,
    userID: "userA"
  },
  {
    photoID: 3,
    userID: "userC"
  }
];

var _id = 0;
const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allUsers: () => users,
    allPhotos: () => photos
  },
  Mutation: {
    // name と description を渡したらそれを登録する。
    // id や url は自動生成
    postPhoto: (parent, args) => {
      var newPhoto = {
        id: _id++,
        ...args.input
      };
      photos.push(newPhoto);
      return newPhoto;
    }
  },
  // 任意で追加できる、トリビアルリゾルバ
  User: {
    postedPhotos: parent => {
      return photos.filter(photo => photo.githubUser === parent.githubLoginID);
    },
    inPhotos: parent => {
      return tags
        .filter(tag => tag.userID === parent.githubLoginID)
        .map(tag => photos.find(photo => photo.id === tag.photoID));
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLoginID === parent.githubUser);
    },
    //taggedUsers: []
    taggedUsers: parent => {
      return tags
        .filter(tag => tag.photoID === parent.id)
        .map(tag => users.find(user => user.githubLoginID === tag.userID));
    }
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value`,
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
};

const server = new ApolloServer({ typeDefs, resolvers });

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
