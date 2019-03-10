"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Attachment {
    constructor(text, buttons) {
        this.type = 'template';
        this.payload = { template_type: 'button', text, buttons };
    }
}
exports.Attachment = Attachment;
class Button {
    constructor(title, url) {
        this.type = 'web_url';
        this.title = title;
        this.url = url;
    }
}
exports.Button = Button;
class ButtonMessage {
    constructor(text, buttons) {
        this.message = { attachment: new Attachment(text, buttons) };
    }
}
exports.ButtonMessage = ButtonMessage;
//# sourceMappingURL=ButtonMessage.js.map