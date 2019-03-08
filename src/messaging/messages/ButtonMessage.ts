import { Message } from '../../models';

export class Attachment {
  type: 'template';
  payload: {
    template_type: 'button';
    text: string;
    buttons: Button[];
  };

  constructor(text: string, buttons: Button[]) {
    this.type = 'template';
    this.payload = { template_type: 'button', text, buttons };
  }
}

export class Button {
  type: 'web_url';
  title: string;
  url: string;

  constructor(title: string, url: string) {
    this.type = 'web_url';
    this.title = title;
    this.url = url;
  }
}

export class ButtonMessage implements Message {
  message: { attachment: Attachment };

  constructor(text: string, buttons: Button[]) {
    this.message = { attachment: new Attachment(text, buttons) };
  }
}
