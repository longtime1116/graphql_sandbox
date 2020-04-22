* mongodb
  * .envに書くやつ↓
    * DB_HOST=mongodb://localhost:27017/photo_share_api

```
# 起動
brew services start mongodb-community
# 停止
brew services stop mongodb-community
```

* githubのcodeの取得方法
  * `https://github.com/login/oauth/authorize?client_id=<YOUR ID>&scope=true`
  * 詳しくは[こちら](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#1-request-a-users-github-identity)

