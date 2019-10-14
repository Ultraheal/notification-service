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
initializeDb( elastic => {
	// api router
	app.use('/api', api({ config, elastic }));

	// websocket server
	app.use(websocketServer({ config, elastic }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Api running on port ${app.server.address().port}`);
	});
});

export default app;
