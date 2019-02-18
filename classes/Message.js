`use strict`;

const { User } = require('./User');

class Message {
  constructor(sender, message) {
    if (!(sender instanceof User)) {
      throw `'sender' must be an instance of 'User' class`;
    }

    this.sender = sender;
    if (this.isPostback(message)) {
      this.postback = message;
    } else {
      this.message = message;
    }
  }

  get text() {
    if (this.isPostback()) {
      return this.postback.payload;
    } else {
      return this.message.text;
    }
  }

  isPostback(message) {
    if (message && message.payload) {
      return true;
    } else if (this.postback) {
      return true;
    } else {
      return false;
    }
  }

  hasNlpEntities(type) {
    return (
      this.message &&
      this.message.nlp &&
      this.message.nlp.entities &&
      this.message.nlp.entities[type]
    );
  }

  getFirstNlpEnitityOfType(type) {
    if (this.hasNlpEntities(type)) {
      return this.message.nlp.entities[type][0].value;
    } else {
      return null;
    }
  }

  static assureType(object) {
    if (!(object instanceof Message)) {
      throw `Object must be an instance of 'Message' class`;
    }
  }
}

module.exports = { Message };
