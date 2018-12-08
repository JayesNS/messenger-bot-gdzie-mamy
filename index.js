'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json());

var access = fs.createWriteStream('/node.access.log', { flags: 'a' }),
  error = fs.createWriteStream('/node.error.log', { flags: 'a' });

// redirect stdout / stderr
proc.stdout.pipe(access);
proc.stderr.pipe(error);

app.listen(process.env.PORT || 1337, () => console.log('web hook listening'))

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object !== 'page') {
    res.sendStatus(404);
  }
  body.entry.forEach((entry) => {
    let webhook_event = entry.messaging[0];
    console.log(webhook_event);
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
      console.log(new Date(), 'WEBHOOK_VERIFIED');
      res.status(200).send(__dirname + '/node.access.log' + challenge);
    } else {
      res.sendStatus(403);
    }
  }
})