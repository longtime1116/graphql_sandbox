//import { ApolloServer } from "apollo-server";
const { ApolloServer } = require(`apollo-server`);

const typeDefs = `

type Photo {
  id: ID!
  url: String!
  name: String!
  description: String
}

type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
}
type Mutation {
  postPhoto(name: String! description: String): Photo!
}
`;

var photos = [];
var _id = 0;
const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    // name と description を渡したらそれを登録する。
    // id や url は自動生成
    postPhoto: (parent, args) => {
      var newPhoto = {
        id: _id++,
        ...args
      };
      photos.push(newPhoto);
      return newPhoto;
    }
  },
  // 任意で追加できる、トリビアルリゾルバ
  Photo: {
    url: parent => `http://yoursite.com/img${parent.id}.jpg`
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
