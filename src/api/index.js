import { Router } from 'express';
import notifications from './notifications.js';
import databaseApi from './db.js';

export default ({ config, db }) => {
	const api = Router();

	api.use('/notification', notifications({ config, db }));
	api.use('/db', databaseApi({ config, db }));

	api.get('/', require('express-healthcheck')())
	return api;
}
