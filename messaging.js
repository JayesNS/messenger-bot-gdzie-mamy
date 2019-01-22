'use strict';

const request = require('request'),
  PAGE_ACCESS_TOKEN = require('./page-access-token').token;

function handleMessage(senderPsid, receivedMessage) {
  let response;
  const messageText = receivedMessage.text;

  if (compareMessageToTemplate(messageText, 'gdzie mamy?')) {
    response = prepareButtonMessage(
      senderPsid,
      'Tu możesz sprawdzić plan zajęć',
      [
        {
          type: 'web_url',
          url: 'http://planzajec.uek.krakow.pl',
          title: 'Otwórz plan'
        }
      ]
    );
  } else if (compareMessageToTemplate(messageText, '!$')) {
    response = prepareTextMessage(senderPsid, senderPsid);
  } else {
    response = prepareTextMessage(senderPsid, 'W czym mogę pomóc?', {
      quick_replies: [
        {
          content_type: 'text',
          title: 'Gdzie mamy?',
          payload: 'Gdzie mamy?'
        }
      ]
    });
  }

  sendMessage(response);
}

function handlePostback(senderPsid, receivedPostback) {}

function sendMessage(requestBody) {
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: requestBody
    },
    (err, res, body) => {
      if (!err) {
        console.log('message sent!');
        console.log('body', body);
      } else {
        console.error('Unable to send message:' + err);
      }
    }
  );
}

function prepareTextMessage(senderPsid, message, messageOptions) {
  return {
    recipient: {
      id: senderPsid
    },
    message: {
      text: message,
      ...messageOptions
    }
  };
}

function prepareButtonMessage(senderPsid, message, buttons, messageOptions) {
  return {
    recipient: {
      id: senderPsid
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: message,
          buttons
        }
      },
      ...messageOptions
    }
  };
}

/**
 * @description Checks if message exists and compares lowercase values
 * @param {string} message
 * @param {string} messagePredicate
 */
function compareMessageToTemplate(message, messageTemplate) {
  return (
    message &&
    message.toLocaleLowerCase() === messageTemplate.toLocaleLowerCase()
  );
}

module.exports = { handleMessage, handlePostback };
