import { Router } from 'express';
import notifications from './notifications.js';
import databaseApi from './db';

export default ({ config, elastic }) => {
	const api = Router();

	api.use('/notification', notifications({ config, elastic }));

	api.use('/db', databaseApi({ config, elastic }));

	api.get('/', require('express-healthcheck')())
	return api;
}
