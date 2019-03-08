import { Router, Request, Response } from 'express';

import { User, Recipient } from '../models';
import { UserRepo, LocalUserRepo } from '../users';
import { SendApi, MessageHandler } from '../messaging';
import { MarkSeenMessage, TypingOnMessage } from '../messaging/messages';
import { VERIFY_TOKEN } from '../../config';

export class WebhookRoutes {
  public router: Router;
  private sendApi: SendApi;
  private messageHandler: MessageHandler;
  private userRepo: UserRepo;

  constructor() {
    this.router = Router();
    this.sendApi = new SendApi();
    this.userRepo = LocalUserRepo.Instance;
    this.messageHandler = new MessageHandler();

    this.setupRoutes();
  }

  setupRoutes(): void {
    this.router.post('/', (req: Request, res: Response) => {
      let body = req.body;

      if (body.object !== 'page') {
        res.sendStatus(404);
      }

      body.entry.forEach(async entry => {
        const webhookEvent: any = entry.messaging[0];
        const senderId: number = webhookEvent.sender.id;

        const sender: User = await this.userRepo.getUserById(senderId);
        const recipient: Recipient = { id: sender.id };
        Promise.all([
          this.sendApi.sendMessage(recipient, new TypingOnMessage()),
          this.sendApi.sendMessage(recipient, new MarkSeenMessage())
        ]);

        if (webhookEvent.message) {
          this.messageHandler.handleMessageEvent(sender, webhookEvent.message);
        } else if (webhookEvent.postback) {
          this.messageHandler.handlePostbackEvent(sender, webhookEvent.postback);
        } else if (webhookEvent.attachments) {
          this.messageHandler.handleAttachmentEvent(sender, webhookEvent.attachments);
        }
      });

      res.status(200).send('EVENT_RECEIVED');
    });

    this.router.get('/', (req: Request, res: Response) => {
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
