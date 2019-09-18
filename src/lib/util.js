export function apiStatus(res, result = 'OK', code = 200, meta = null) {
	let apiResult = { code: code, result: result };
	if (meta !== null) {
		apiResult.meta = meta;
	}
	res.status(code).json(apiResult);
	return result;
}
