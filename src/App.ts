import * as express from 'express';
import { ApiRoutes } from './routes';
import { UekApi } from './api';

class App {
  public express: express.Express;

  constructor() {
    this.express = express();
    this.mountRoutes();
  }

  private mountRoutes(): void {
    const router = express.Router();
    router.get('/', (req, res) => {
      res.send('Hello World');
    });
    router.use('/api', new ApiRoutes(new UekApi()).router);

    this.express.use(router);
  }
}

export default new App().express;
