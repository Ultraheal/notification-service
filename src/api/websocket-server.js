import { Router } from 'express';
const express = require('express');
const app = express();

export default ({ config, elastic }) => {
    let websocketApi = Router();
    const server = app.listen(config.websocket_port, () => {
        console.log(`Websocket server running on port ${config.websocket_port}`);
    });
    const io = require('socket.io')(server);
    io.on('connection', socket => {
        console.log('Connection to websocket server')
        socket.on('message', searchParams => {
            if (!searchParams.user_id) {
                console.error('user_id is required');
                socket.send('user_id is required')
            } else {
                elastic.search({
                    index: 'notifications',
                    body: {
                        from: searchParams.from || 0,
                        size: searchParams.size || 10,
                        query: {
                            term : { user_id: searchParams.user_id }
                        }
                    }
                })
                .then((result) => {
                    console.log('Recieved Elastic Search result', result)
                    socket.send(result)
                })
            }
        });
    });
    return websocketApi
}