import * as express from 'express';
import * as bodyParser from 'body-parser';

import { ApiRoutes, WebhookRoutes } from './routes';
import { UekApi } from './api';

class App {
  public express: express.Express;

  constructor() {
    this.express = express().use(bodyParser.json());
    this.mountRoutes();
  }

  private mountRoutes(): void {
    const router = express.Router();
    router.get('/', (req, res) => {
      res.send('Hello World');
    });

    router.use('/api', new ApiRoutes(new UekApi()).router);
    router.use('/webhook', new WebhookRoutes().router);

    this.express.use(router);
  }
}

export default new App().express;
