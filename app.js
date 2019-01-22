'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json());

app.listen(process.env.PORT || 1337, () => console.log('web hook listening'));

app.get('/', (req, res) => {
  res.send(process.env.PORT);
});

app.use('/webhook', require('./webhook'));
