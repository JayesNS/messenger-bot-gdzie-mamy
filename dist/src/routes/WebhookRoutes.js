"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../users");
const messaging_1 = require("../messaging");
const messages_1 = require("../messaging/messages");
const config_1 = require("../../config");
class WebhookRoutes {
    constructor() {
        this.router = express_1.Router();
        this.sendApi = new messaging_1.SendApi();
        this.userRepo = users_1.LocalUserRepo.Instance;
        this.messageHandler = new messaging_1.MessageHandler();
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.post('/', (req, res) => {
            let body = req.body;
            if (body.object !== 'page') {
                res.sendStatus(404);
            }
            body.entry.forEach((entry) => __awaiter(this, void 0, void 0, function* () {
                const webhookEvent = entry.messaging[0];
                const senderId = webhookEvent.sender.id;
                const sender = yield this.userRepo.getUserById(senderId);
                const recipient = { id: sender.id };
                Promise.all([
                    this.sendApi.sendMessage(recipient, new messages_1.TypingOnMessage()),
                    this.sendApi.sendMessage(recipient, new messages_1.MarkSeenMessage())
                ]);
                if (webhookEvent.message) {
                    this.messageHandler.handleMessageEvent(sender, webhookEvent.message);
                }
                else if (webhookEvent.postback) {
                    this.messageHandler.handlePostbackEvent(sender, webhookEvent.postback);
                }
                else if (webhookEvent.attachments) {
                    this.messageHandler.handleAttachmentEvent(sender, webhookEvent.attachments);
                }
            }));
            res.status(200).send('EVENT_RECEIVED');
        });
        this.router.get('/', (req, res) => {
            let mode = req.query['hub.mode'], token = req.query['hub.verify_token'], challenge = req.query['hub.challenge'];
            if (mode && token) {
                if (mode === 'subscribe' && token === config_1.VERIFY_TOKEN) {
                    console.log('WEBHOOK_VERIFIED');
                    res.status(200).send(challenge);
                }
                else {
                    res.sendStatus(403);
                }
            }
        });
    }
}
exports.WebhookRoutes = WebhookRoutes;
//# sourceMappingURL=WebhookRoutes.js.map