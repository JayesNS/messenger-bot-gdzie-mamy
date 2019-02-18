`use strict`;

const request = require('request');

const { PAGE_ACCESS_TOKEN } = require('./../page-access-token');
const { Message } = require('./Message');

class SendApi {
  static sendSenderAction(senderId, type) {
    const responseBody = {
      recipient: {
        id: senderId
      },
      sender_action: type
    };

    return makeRequest(responseBody);
  }

  static sendMessageFromTemplate(responseTemplate, payload) {
    Message.assureType(payload.message);
    if (
      Object.getOwnPropertyNames(responseTemplate).every(
        property => property !== 'trigger' && property !== 'content'
      )
    ) {
      throw `'responseTemplate' contains invalid properties. Make sure it contains only 'trigger' and 'content' properties`;
    }

    this.sendMessage(responseTemplate.content(payload), payload);
  }

  static sendMessage(content, payload) {
    Message.assureType(payload.message);

    const responseBody = {
      recipient: {
        id: payload.message.sender.id
      },
      message: content
    };

    return makeRequest(responseBody);
  }
}

function makeRequest(messageBody) {
  return new Promise((resolve, reject) =>
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageBody
      },
      (error, res, body) => {
        if (error) {
          reject(error);
        }

        resolve(body);
      }
    )
  );
}

module.exports = { SendApi };
