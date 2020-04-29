# curl で graphql サーバを叩く
curl -X POST -H "Content-Type: application/json" --data '{"query": "{totalUsers, totalPhotos}"}' http://localhost:4000/graphql
