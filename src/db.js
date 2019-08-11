import elasticSearch from 'elasticsearch';
import config from './config.json';

export default callback => {
	const elastic = new elasticSearch.Client({
		host: `http://${config.elasticSearch.host}:${config.elasticSearch.port}`
	});
	callback(elastic);
}
