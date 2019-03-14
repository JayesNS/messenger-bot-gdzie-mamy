"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QuickReply {
    constructor(title, payload) {
        this.content_type = 'text';
        this.payload = payload || title;
        this.title = title;
    }
}
exports.QuickReply = QuickReply;
class TextMessage {
    constructor(messageBody, quickReplies) {
        this.message = { text: messageBody, quick_replies: quickReplies || undefined };
    }
}
exports.TextMessage = TextMessage;
//# sourceMappingURL=TextMessage.js.map