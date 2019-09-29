import { Router } from 'express';
import {apiStatus} from "../lib/util";

export default ({ config, db }) => {
    const dbApi = Router();

    dbApi.get('/health', (req, res) => {
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
    return dbApi;
}
