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
const ResponseMessageRepo_1 = require("./ResponseMessageRepo");
const SendApi_1 = require("./SendApi");
const messages_1 = require("./messages");
const HandleGroupSelection_1 = require("./response-messages/HandleGroupSelection");
const response_messages_1 = require("./response-messages");
class MessageHandler {
    constructor() {
        this.responseRepo = new ResponseMessageRepo_1.ResponseMessageRepo();
        this.sendApi = new SendApi_1.SendApi();
    }
    handleMessageEvent(sender, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = this.responseRepo.getResponseByTrigger(message.text);
            if (!response) {
                this.handleUnusualMessage(sender, message);
                return;
            }
            this.sendApi.sendMessage({ id: sender.id }, yield response.create({ sender, message }));
            sender.addHistoryRecord(response.id);
            this.sendApi.sendMessage({ id: sender.id }, new messages_1.TypingOffMessage());
        });
    }
    handlePostbackEvent(sender, postback) {
        console.log('postbackEvent', postback);
        this.handleMessageEvent(sender, postback);
    }
    handleAttachmentEvent(sender, attachments) {
        console.log('attachmentEvent', attachments);
        this.handleMessageEvent(sender, { text: 'attachment' });
    }
    handleUnusualMessage(sender, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (content.text && sender.getLastHistoryRecord() === new response_messages_1.Configure().id) {
                this.sendApi.sendMessage({ id: sender.id }, yield new HandleGroupSelection_1.HandleGroupSelection().create({ sender, message: content }));
            }
            else {
                this.sendApi.sendMessage({ id: sender.id }, new messages_1.TextMessage('Nie obsługiwane polecenie'));
            }
        });
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map