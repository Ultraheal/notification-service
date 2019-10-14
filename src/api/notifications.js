import { Router } from 'express';
import { apiStatus } from '../lib/util';
import mapping from '../resources/mapping';

export default ({ config, elastic }) => {
    const notificationsApi = Router();
    const mysql = require('mysql');
    const mysqlConnection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'db'
    });
    const putMapping = () => {
        console.log('Creating index mapping');
        elastic.indices.putMapping({
            index: 'notifications',
            body: {
                properties: mapping
            }
        }, (err, resp, status) => {
            if (err) {
                console.error(err, status);
            }
            else {
                console.log('Successfully created mapping', status, resp);
            }
        });
    }

    const createMysqlTable = () => {
        const notificationsTable = `create table if not exists notifications(
                            id int primary key auto_increment,
                            user_id int default null,
                            order_id int default null,
                            deleted tinyint(1) not null default 0,
                            readed tinyint(1) not null default 0,
                            text varchar(255),
                            notify_type varchar(255),
                            created_at varchar(255) not null,
                            updated_at varchar(255)      
                        )`;
        mysqlConnection.query(notificationsTable, (err, results, fields) => {
          if (err) {
            console.log(err.message);
          }
        });
    }

    const checkIndices = () => {
        elastic.indices.exists({index: 'notifications'}, (err, res) => {
            if (res) {
                console.log('Index already exists');
            } else {
                elastic.indices.create( {index: 'notifications'}, (err, res, status) => {
                    console.log(err, res, status);
                    putMapping()
                })
            }
        })
    }

    checkIndices()
    createMysqlTable()

    notificationsApi.post('/create', (req, res) => {
        const notificationsArray = req.body.notifications
        if (!notificationsArray && !notificationsArray.length) {
            apiStatus(res, 'data is required', 500);
        }
        const createNotifications = async (notifications) => {
            let result = []
            const notificationValues = notifications.map(item => {
              return Object.values(item)
            })
            const notificationKeys = Object.keys(notifications[0]).join(',')
            mysqlConnection.query(`INSERT INTO notifications (${notificationKeys}) VALUES ?`, [notificationValues], (err, res) => {
                if (err) {
                  const error = `mysql error: ${err.sqlMessage}`
                  console.error(error)
                  result.push(error)
                }
            })
            await notifications.forEach(async elem => {
                elem.updated_at = new Date(Date.now()).toString()
                await elastic.index({
                    index: 'notifications',
                    id: elem.id,
                    body: elem
                })
                    .then(res => { result.push(res) })
                    .catch(error => {
                        result.push(error)
                        console.error(error)
                    })
            })
            elastic.indices.refresh({ index: 'notifications' })
            return result
        }
        createNotifications(notificationsArray)
            .then(result => { apiStatus(res, result, 200) })
            .catch(error => { apiStatus(res, error, 500) })
    })

    notificationsApi.post('/get', (req, res) => {
        if (!req.body.user_id) {
            apiStatus(res, 'user_id is required', 500);
        }
        elastic.search({
            index: 'notifications',
            body: {
                from: req.body.from || 0,
                size: req.body.size || 10,
                query: {
                    term : { user_id: req.body.user_id }
                }
            }
        })
            .then((result) => {
                apiStatus(res, result, 200)
            })
    })

    notificationsApi.post('/update', (req, res) => {
        if (!req.body.user_id) {
            apiStatus(res, 'id is required', 500);
        }
        const currentDate = new Date(Date.now()).toString()
        elastic.updateByQuery({
            index: 'notifications',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    user_id: req.body.user_id
                                }
                            },
                            {
                                terms: {
                                    id: req.body.notification_ids
                                }
                            }
                        ]
                    }
                },
                script: {
                    inline: `ctx._source.${req.body.update_type} = true; ctx._source.updated_at = '${currentDate}';`
                }
            }
        })
            .then(result => { apiStatus(res, result, 200) })
    })

    return notificationsApi;
}
