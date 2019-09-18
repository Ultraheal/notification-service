import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import api from './api';
import config from './config.json';
import websocketServer from './api/websocket-server'

let app = express();
app.server = http.createServer(app);

app.use('/', require('express-healthcheck')())

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {
	// api router
	app.use('/api/notifications', api({ config, db }));

	// websocket server
	app.use(websocketServer({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Api running on port ${app.server.address().port}`);
	});
});

export default app;
