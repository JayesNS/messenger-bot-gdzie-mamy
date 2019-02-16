`use strict`;

const request = require('request');
const { PAGE_ACCESS_TOKEN } = require('./../page-access-token');

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

  static sendMessageFromTemplate(response, payload) {
    // TODO: payload must be an instance of Message
    // TODO: response must be an instance of Response class
    this.sendMessage(response.content(payload), payload);
  }

  static sendMessage(content, payload) {
    // TODO: payload must be an instance of Message
    // TODO: content must be a string

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
