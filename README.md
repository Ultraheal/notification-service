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
Connect to ES cluster
---------------
```sh
# at src/api/index.js
const elastic = new elasticSearch.Client({
	host: 'http://localhost:9200'
});
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
License
-------
MIT
