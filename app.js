'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()),
  request = require('request');

const PAGE_ACCESS_TOKEN = require('./page-access-token').token;

app.listen(1337, () => console.log('web hook listening'));

app.get('/', (req, res) => {
  res.send(process.env.PORT);
});

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object !== 'page') {
    res.sendStatus(404);
  }

  body.entry.forEach(entry => {
    const webhookEvent = entry.messaging[0];
    const senderPsid = webhookEvent.sender.id;
    console.log(webhookEvent);

    if (webhookEvent.message) {
      handleMessage(senderPsid, webhookEvent.message);
    } else if (webhookEvent.postback) {
      handlePostback(senderPsid, webhookEvent.postback);
    }
  });

  res.status(200).send('EVENT_RECEIVED');
});

app.get('/webhook', (req, res) => {
  let VERIFY_TOKEN = 'albert:gdzie-mamy';

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

function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    if (receivedMessage.text.toLowerCase() === 'gdzie mamy?') {
      prepareMessage(senderPsid, 'tu masz plan', null);
    }
    response = {
      text: receivedMessage.text
    };
  }

  console.log(
    prepareMessage(senderPsid, 'elo mordo', null, {
      quick_replies: [
        {
          content_type: 'web_url',
          title: 'Gdzie mamy?',
          payload: 'Gdzie mamy?',
          url: 'http://planzajec.uek.krakow.pl'
        }
      ]
    })
  );
  sendMessage(
    prepareMessage(senderPsid, 'elo mordo', null, {
      quick_replies: [
        {
          content_type: 'text',
          title: 'Gdzie mamy?',
          payload: 'Gdzie mamy?'
        }
      ]
    })
  );
}

function handlePostback(senderPsid, receivedPostback) {}

function callSendAPI(senderPsid, response) {
  let requestBody = {
    recipient: {
      id: '' + senderPsid
    },
    message: response
  };

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

function prepareMessage(senderPsid, text, buttons, messageOptions) {
  return {
    recipient: {
      id: senderPsid
    },
    message: {
      text,
      // attachment: {
      //   type: 'template',
      //   payload: {
      //     template_type: 'button',
      //     text: 'Przetestuj przycisk',
      //     buttons
      //   }
      // },
      ...messageOptions
    }
  };
}

function prepareButton(type, title) {
  // return {
  //   type: 'web_url',
  //   url: 'http://planzajec.uek.krakow.pl',
  //   title: 'Sprawdź plan',
  //   webview_height_ratio: 'full'
  // };

  return {
    type: 'postback',
    title: 'Gdzie mamy?',
    payload: 'Gdzie mamy?'
  };
}
