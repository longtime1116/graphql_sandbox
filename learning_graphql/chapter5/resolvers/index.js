const { GraphQLScalarType } = require(`graphql`);
const fetch = require("node-fetch");

// FIXME: mongodb を使うようになったのでこれらのローカル変数は不要になったはず。
//        参照しているところを 修正し、削除する
var users = [
  {
    githubLogin: "userA",
    name: "Alice",
  },
  {
    githubLogin: "userB",
    name: "Bob",
  },
  {
    githubLogin: "userC",
    name: "Chris",
  },
];

var photos = [
  {
    id: 1,
    name: "1_photo",
    description: "This is 1_photo",
    category: "SELFIE",
    githubUser: "userA",
    createdAt: "3-15-2020",
  },
  {
    id: 2,
    name: "2_photo",
    description: "This is 2_photo",
    category: "PORTRATE",
    githubUser: "userB",
    createdAt: "12-20-2019",
  },
  {
    id: 3,
    name: "3_photo",
    description: "This is 3_photo",
    category: "ACTION",
    githubUser: "userB",
    createdAt: "2020-04-01T15:36:11.308Z",
  },
];

var tags = [
  {
    photoID: 1,
    userID: "userA",
  },
  {
    photoID: 2,
    userID: "userB",
  },
  {
    photoID: 3,
    userID: "userA",
  },
  {
    photoID: 3,
    userID: "userC",
  },
];

const requestGithubToken = (credentials) =>
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });

const requestGithubUserAccount = (token) =>
  fetch(`https://api.github.com/user?access_token=${token}`)
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });
async function authorizeWithGithub(credentials) {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
}

var _id = 0;
const resolvers = {
  Query: {
    me: (parent, args, { currentUser }) => currentUser,
    totalUsers: (parent, args, { db }) =>
      db.collection(`users`).estimatedDocumentCount(),
    totalPhotos: (parent, args, { db }) =>
      db.collection(`photos`).estimatedDocumentCount(),
    allUsers: (parent, args, { db }) => db.collection(`users`).find().toArray(),
    allPhotos: (parent, args, { db }) =>
      db.collection(`photos`).find().toArray(),
    //allPhotos: (parent, args) => {
    //    return photos.filter(
    //        photo =>
    //            new Date(photo.createdAt).getTime() > new Date(args.after).getTime()
    //    );
    //}
  },
  Mutation: {
    // name と description を渡したらそれを登録する。
    // id や url は自動生成
    async postPhoto(parent, args, { db, currentUser, pubsub }) {
      if (!currentUser) {
        throw new Error("only an authorized user can post a photo");
      }
      var newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        createdAt: new Date(),
      };
      const { insertedIds } = await db.collection("photos").insert(newPhoto);
      newPhoto.id = insertedIds[0];
      // postPhoto mutation が実行されたとき、"photo-added" イベントを発行する
      pubsub.publish("photo-added", { newPhoto });
      return newPhoto;
    },
    async fakeUserAuth(parent, { githubLogin }, { db }) {
      var user = await db.collection("users").findOne({ githubLogin });
      if (!user) {
        throw new Error(`Cannot find user with githubLogin ${githubLogin}`);
      }
      return {
        token: user.githubToken,
        user,
      };
    },
    async githubAuth(parent, { code }, { db }) {
      let {
        message,
        access_token,
        avatar_url,
        login,
        name,
      } = await authorizeWithGithub({
        client_id: process.env.GITHUB_CLIENT_CODE,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      });

      if (message) {
        throw new Error(message);
      }

      let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url,
      };

      const {
        ops: [user],
      } = await db
        .collection("users")
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      return { user, token: access_token };
    },
    addFakeUsers: async (root, { count }, { db }) => {
      var randomUserApi = `https://randomuser.me/api/?results=${count}`;
      var { results } = await fetch(randomUserApi).then((res) => res.json());
      var users = results.map((r) => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1,
      }));
      await db.collection("users").insert(users);
      return users;
    },
  },
  Subscription: {
    // client は事前に newPhoto を呼び出してwebsocketを開いておく。
    // そうすると、"photo-added"イベントが発行されたときに通知を受け取ることができる
    newPhoto: {
      subscribe: (parent, args, { pubsub }) =>
        pubsub.asyncIterator("photo-added"),
    },
  },
  // 任意で追加できる、トリビアルリゾルバ
  User: {
    postedPhotos: (parent) => {
      return photos.filter((photo) => photo.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) => {
      return tags
        .filter((tag) => tag.userID === parent.githubLogin)
        .map((tag) => photos.find((photo) => photo.id === tag.photoID));
    },
  },
  Photo: {
    id: (parent) => parent.id || parent._id,
    url: (parent) => `http://yoursite.com/img${parent._id}.jpg`,
    postedBy: (parent, args, { db }) => {
      return db.collection("users").findOne({ githubLogin: parent.userID });
    },
    //taggedUsers: []
    taggedUsers: (parent) => {
      return tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => users.find((user) => user.githubLogin === tag.userID));
    },
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value`,
    parseValue: (value) => new Date(value), // これでエラーにならないもののみがDateTime型とみなされる
    serialize: (value) => new Date(value).toISOString(), // ISOString で返されるようにする
    parseLiteral: (ast) => ast.value, // クエリ引数を parse するのに使う
  }),
};

module.exports = resolvers;
