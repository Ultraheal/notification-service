// import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
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
				console.log('index already exists');
			} else {
				elastic.indices.create( {index: 'notifications'}, (err, res, status) => {
					console.log(err, res, status);
					putMapping()
				})
			}
		})
	}

	const putMapping = () => {
		console.log("Creating Mapping index");
		elastic.indices.putMapping({
			index: 'notifications',
			body: {
				properties: {
					userId: { type: 'text' },
					orderId: { type: 'text' },
					deleted: { type: 'text' },
					readed: { type: 'text' },
					id: { type: 'text' },
					text: { type: 'text' },
					type: { type: 'text' },
					created_on: { type: 'date' },
					updated_at: { type: 'date' } }
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
	const run = async () => {
		// Let's start by indexing some data
		await elastic.index({
			index: 'game-of-thrones',
			// type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
			body: {
				character: 'Ned Stark',
				quote: 'Winter is coming.'
			}
		})

		await elastic.index({
			index: 'game-of-thrones',
			// type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
			body: {
				character: 'Daenerys Targaryen',
				quote: 'I am the blood of the dragon.'
			}
		})

		await elastic.index({
			index: 'game-of-thrones',
			// type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
			body: {
				character: 'Tyrion Lannister',
				quote: 'A mind needs books like a sword needs a whetstone.'
			}
		})

		// here we are forcing an index refresh, otherwise we will not
		// get any result in the consequent search
		await elastic.indices.refresh({ index: 'game-of-thrones' })

		// Let's search!
		const { body } = await elastic.search({
			index: 'game-of-thrones',
			// type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
			body: {
				query: {
					match: { quote: 'winter' }
				}
			}
		})

		console.log(body)
	}

	run().catch(console.log)

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	// api.get('/', (req, res) => {
	// 	res.json({ version });
	// });

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


	return api;
}
