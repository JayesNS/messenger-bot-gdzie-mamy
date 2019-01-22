const express = require('express'),
  router = express.Router(),
  request = require('request'),
  xml2json = require('xml2json');

const apiUrl = 'http://planzajec.uek.krakow.pl';

router.get('/get-groups', (req, res) => {
  getAllGroups((groups, error) => {
    if (error) {
      res.status(503).send(error);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(groups);
  });
});
router.get('/get-groups/:group', (req, res) => {
  if (!req.params) {
    res.status(503).send('error');
  }

  const group = req.params.group;

  res.status(200).send(group);
});

function getAllGroups(callback) {
  request(urlToAllGroups(), (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.error('[GdzieMamy? API]', error);
      callback(null, error);
    }

    const rawData = convertXMLToJSON(body);

    callback(extractGroupsFromRawData(rawData));
  });
}

const extractGroupsFromRawData = data =>
  data['plan-zajec']['zasob'].map(group => ({
    id: group['id'],
    name: group['nazwa']
  }));
const urlToAllGroups = () => `${apiUrl}?typ=G&xml`;
const urlToGroup = groupId => `${apiUrl}?xml`;

function convertXMLToJSON(rawXML) {
  return JSON.parse(xml2json.toJson(rawXML));
}

module.exports = router;
