import { Router } from 'express';
import { apiStatus } from '../lib/util';
import mapping from '../resources/mapping';

export default ({ config, db }) => {
	const api = Router();

	const putMapping = () => {
		console.log('Creating index mapping');
		db.indices.putMapping({
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

	const checkIndices = () => {
		db.indices.exists({index: 'notifications'}, (err, res) => {
			if (res) {
				console.log('Index already exists');
			} else {
				db.indices.create( {index: 'notifications'}, (err, res, status) => {
					console.log(err, res, status);
					putMapping()
				})
			}
		})
	}

	checkIndices()

	api.get('/', (req, res) => {
		db.ping({
			requestTimeout: 1000
		}, error => {
			if (error) {
				apiStatus(res, 'Elastic cluster is down', 500)
				console.error(error);
			} else {
				apiStatus(res, 'Elastic cluster is ready', 200)
			}
		});
	})

	api.post('/create', (req, res) => {
		if (!req.body.notifications && !req.body.notifications.length) {
			apiStatus(res, 'data is required', 500);
		}
		const createNotifications = async (notifications) => {
			let result = []
			await notifications.forEach(async elem => {
				elem.updated_at = new Date(Date.now()).toString()
				await db.index({
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
			await db.indices.refresh({ index: 'notifications' })
			return result
		}
		createNotifications(req.body.notifications)
			.then(result => { apiStatus(res, result, 200) })
	})

	api.post('/get', (req, res) => {
		if (!req.body.user_id) {
			apiStatus(res, 'user_id is required', 500);
		}
		db.search({
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

	api.post('/update', (req, res) => {
		if (!req.body.user_id) {
			apiStatus(res, 'id is required', 500);
		}
		const currentDate = new Date(Date.now()).toString()
		db.updateByQuery({
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

	return api;
}
