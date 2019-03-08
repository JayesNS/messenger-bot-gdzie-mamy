import { Router, Request, Response } from 'express';

import { User } from '../models';
import { UserRepo, LocalUserRepo } from '../users';

export class WebhookRoutes {
  public router: Router;
  private sendApi;
  private messageHandler;
  private userRepo: UserRepo;

  constructor() {
    this.router = Router();
    this.userRepo = new LocalUserRepo();

    this.setupRoutes();
  }

  setupRoutes(): void {
    this.router.post('/', async (req: Request, res: Response) => {
      let body = req.body;

      if (body.object !== 'page') {
        res.sendStatus(404);
      }

      body.entry.forEach(async entry => {
        const webhookEvent: any = entry.messaging[0];
        const senderId: number = webhookEvent.sender.id;

        const sender: User = await this.userRepo.getUserById(senderId);

        /* SendApi.sendSenderAction(senderId, 'typing_on');
        if (webhookEvent.message) {
          Messaging.handleMessage(senderId, webhookEvent.message);
        } else if (webhookEvent.postback) {
          Messaging.handleMessage(senderId, webhookEvent.postback);
        } */
      });

      res.status(200).send('EVENT_RECEIVED');
    });

    this.router.get('/', (req, res) => {
      let VERIFY_TOKEN = 'albert:gdzie-mamy';

      let mode = req.query['hub.mode'],
        token = req.query['hub.verify_token'],
        challenge = req.query['hub.challenge'];

      if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);
        }
      }
    });
  }
}
