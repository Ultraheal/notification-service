import { Router } from 'express';
import { apiStatus } from '../lib/util';
import elasticSearch from 'elasticsearch';

export default ({ config, db }) => {
	let api = Router();
	const elastic = new elasticSearch.Client({
		host: 'http://localhost:9200'
	});

	const checkIndices = () => {
		elastic.indices.exists({index: 'notifications'}, (err, res, status) => {
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

	const putMapping = () => {
		console.log('Creating index mapping');
		elastic.indices.putMapping({
			index: 'notifications',
			body: {
				properties: {
					userId: { type: 'integer' },
					orderId: { type: 'integer' },
					deleted: { type: 'boolean' },
					readed: { type: 'boolean' },
					id: { type: 'integer' },
					text: { type: 'text' },
					type: { type: 'text' },
					created_on: { type: 'text' },
					updated_at: { type: 'text' } }
			}
		}, (err,resp, status) => {
			if (err) {
				console.error(err, status);
			}
			else {
				console.log('Successfully Created Index', status, resp);
			}
		});
	}

	api.get('/', (req, res) => {
		elastic.ping({
			requestTimeout: 1000
		}, function (error) {
			if (error) {
				console.trace('elasticsearch cluster is down!');
			} else {
				console.log('All is well');
			}
		});
		checkIndices()
		putMapping()
		apiStatus(res, 'Api up', 200)
	})

	api.post('/create', (req, res) => {
		if (!req.body.notifications && !req.body.notifications.length) {
			return apiStatus(res, 'data is required', 500);
		}
		const createNotifications = async (notifications) => {
			let result = []
			await notifications.forEach(async elem => {
				await elastic.index({
					index: 'notifications',
					id: elem.id,
					body: elem
				})
				.then(res => {result.push(res)})
				.catch(error => {
					result.push(error)
					console.error(error)
				})
			})
			await elastic.indices.refresh({ index: 'notifications' })
			return result
		}
		createNotifications(req.body.notifications)
			.then((result) => {return apiStatus(res, result, 200)})
	})

	api.post('/get', (req, res) => {
		if (!req.body.id) {
			return apiStatus(res, 'id is required', 500);
		}
		elastic.search({
			index: 'notifications',
			body: {
				from: req.body.from || 0,
				size: req.body.size || 10,
				query: {
					term : { user_id: req.body.id }
				}
			}
		})
		.then((result) => {
			console.log(result)
			return apiStatus(res, result, 200)
		})
	})

	api.post('/update', (req, res) => {
		if (!req.body.id) {
			return apiStatus(res, 'id is required', 500);
		}
		elastic.updateByQuery({
			index: 'notifications',
			body: {
				query: {
					term : { user_id: req.body.id }
				},
				script: { inline: "ctx._source.readed = true"}
			}
		})
		.then((result) => {
			console.log(result)
			return apiStatus(res, result, 200)
		})
	})

	return api;
}
