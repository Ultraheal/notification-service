
/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */
export function toRes(res, status=200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err);

		if (thing && typeof thing.toObject==='function') {
			thing = thing.toObject();
		}
		res.status(status).json(thing);
	};
}
export function apiStatus(res, result = 'OK', code = 200, meta = null) {
	let apiResult = { code: code, result: result };
	if (meta !== null) {
		apiResult.meta = meta;
	}
	res.status(code).json(apiResult);
	return result;
}