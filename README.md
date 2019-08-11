Node.js Express Notification Service
==================================
Required ElasticSearch 7.x.x version

Install
---------------

```sh
# clone
git clone https://github.com/Ultraheal/notification-service.git
cd notification-service

# Install dependencies
use your favorite package manager:
npm install or yarn

# Start development live-reload server
PORT=8080 npm run dev or yarn dev

# Start production server:
PORT=8080 npm start or yarn start
```
Configuration
---------------
```sh
# at src/config.json

# Point your own host and port for ElasticSearch cluster

# Change port for running Websocket server

# You can use environment variables for running aplication server,
# like PORT=8080 npm start, or change port at config file
```
Websocket support
---------------
```sh
# This project support getting data from ElasticSearch by Websocket protocol.

# You can find a simple example of client application for Vue.js
# at src/example/client.js folder

# In this example, you must install socket.io-client dependency for your Vue project:
npm i socket.io-client
```
Endpoints
---------------
```sh
# /create
# Create a group of notifications from array
# METHOD: POST
# request example:

{
  "notifications" : [
    {
      "user_id": 1,
      "order_id": null,
      "readed": false,
      "deleted": false,
      "created_at": "14.04.19",
      "type": "new_message",
      "text": "notification text",
      "id": 1
    },
    {
      "user_id": 2,
      "order_id": null,
      "readed": false,
      "deleted": false,
      "created_at": "14.04.19",
      "type": "order_changes",
      "text": "notification text",
      "id": 2
    }
  ]
}
-------------------------------------------------------
# /get
# Get user notifications with pagination parameters
# METHOD: POST
# request example:

{
  "from": 0,
  "size": 10,
  "user_id": 2
}
-------------------------------------------------------
# /update
# Mark group of notifications as readed or deleted
# METHOD: POST
# request example:

{
  "user_id": 4,
  "notification_ids": [2, 5],  //ids of notifications to update
  "update_type": "readed" //type of update mark (readed or deleted)
}
```
Docker Support
------
```sh
cd notification-service

# Build your docker
docker build -t notification-service .
#            ^      ^                ^
#          tag  tag name            Dockerfile location

# run your docker
docker run -p 8080:8080 notification-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```
License
-------
MIT
