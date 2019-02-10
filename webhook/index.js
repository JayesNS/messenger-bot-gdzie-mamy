'use strict';

const express = require('express'),
  router = express.Router();

const { Messaging } = require('../classes/Messaging');

router.post('/', (req, res) => {
  let body = req.body;

  if (body.object !== 'page') {
    res.sendStatus(404);
  }

  body.entry.forEach(entry => {
    const webhookEvent = entry.messaging[0];
    const senderPsid = webhookEvent.sender.id;
    console.log(webhookEvent);

    Messaging.sendSenderAction(senderPsid, 'typing_on');
    if (webhookEvent.message) {
      Messaging.handleMessage(senderPsid, webhookEvent.message);
    } else if (webhookEvent.postback) {
      Messaging.handlePostback(senderPsid, webhookEvent.postback);
    }
  });

  res.status(200).send('EVENT_RECEIVED');
});

router.get('/', (req, res) => {
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

module.exports = router;
