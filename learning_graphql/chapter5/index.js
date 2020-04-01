//import { ApolloServer } from "apollo-server";
const { ApolloServer } = require(`apollo-server`);

const typeDefs = `

enum PhotoCategory {
  SELFIE
  PORTRATE
  ACTION
  LANDSCAPE
  GRAPHIC
  OTHERS
}

type User {
  githubLoginID: ID!
  name: String
  avatar: String
  postedPhotos: [Photo!]!
}

type Photo {
  id: ID!
  url: String!
  name: String!
  category: PhotoCategory!
  description: String
  postedBy: User!
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
    githubUser: "userA"
  },
  {
    id: 2,
    name: "2_photo",
    description: "This is 2_photo",
    category: "SELFIE",
    githubUser: "userB"
  },
  {
    id: 3,
    name: "3_photo",
    description: "This is 3_photo",
    category: "ACTION",
    githubUser: "userB"
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
      return photos.filter(photo => photo.githubUser == parent.githubLoginID);
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLoginID == parent.githubUser);
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
