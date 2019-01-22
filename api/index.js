'use strict';

const express = require('express'),
  router = express.Router(),
  request = require('request'),
  xml2json = require('xml2json');

const apiUrl = 'http://planzajec.uek.krakow.pl';

// https://gdziemamy.jsthats.pl/api/...
router.get('/groups', (req, res) => {
  getJSONFromUrl(urlToAllGroups(), selectAllGroups, null, (groups, error) => {
    if (error) {
      res.status(503).send(error);
    }

    res.status(200).json(groups);
  });
});
router.get('/groups/:groupName', (req, res) => {
  if (!req.params) {
    res.status(503).send('error');
  }

  const NUMBER_OF_SUGGESTED_GROUPS = 5;
  const group = req.params.groupName;

  getJSONFromUrl(urlToAllGroups(), selectGroup, group, (groups, error) => {
    if (error) {
      res.status(503).send(error);
    }

    if (groups.length > NUMBER_OF_SUGGESTED_GROUPS) {
      groups = [];
    }

    res.status(200).json(groups);
  });
});
router.get('/plans/:groupId', (req, res) => {
  if (!req.params) {
    res.status(503).send('error');
  }

  const groupId = req.params.groupId;

  getJSONFromUrl(
    urlToGroup(groupId),
    selectTodaysLectures,
    null,
    (lectures, error) => {
      if (error) {
        res.status(503).send(error);
      }

      res.status(200).json(lectures);
    }
  );
});
router.get('/plans/:groupId/next/:time?', (req, res) => {
  if (!req.params) {
    res.status(503).send('error');
  }

  const groupId = req.params.groupId;
  const time = req.params.time;

  getJSONFromUrl(
    urlToGroup(groupId),
    selectNextLecture,
    time,
    (lecture, error) => {
      if (error) {
        res.status(503).send(error);
      }

      res.status(200).json(lecture);
    }
  );
});

function getJSONFromUrl(url, selector, selectorData, callback) {
  request(url, (error, response, body) => {
    handleError(error, response.statusCode, '[GdzieMamy? API]', callback);

    const data = convertXMLToJSON(body);
    callback(selector ? selector(data, selectorData) : data);
  });
}

// Extractors
const selectAllGroups = data =>
  data['plan-zajec']['zasob'].map(group => parseGroup(group));
const selectGroup = (groups, groupName) =>
  selectAllGroups(groups).filter(group =>
    group.name.toLowerCase().includes(groupName.toLowerCase())
  );
const selectLectures = data => data['plan-zajec']['zajecia'];
const selectTodaysLectures = data =>
  selectLectures(data).filter(lecture =>
    compareOnlyDates(new Date('2019-01-23T07:20'), lecture['termin'])
  );
const selectNextLecture = (data, time) =>
  selectTodaysLectures(data)
    .map(lecture => {
      return {
        ...lecture,
        timeToLecture: timeDifference(
          createTimestamp(lecture['termin'], lecture['od-godz']),
          time
        )
      };
    })
    .filter(lecture => lecture.timeToLecture > 0)[0];

// URLs
const urlToAllGroups = () => `${apiUrl}?typ=G&xml`;
const urlToGroup = groupId => `${apiUrl}?typ=G&id=${groupId}&okres=1&xml`;

// Parsers
const parseGroup = group => ({
  id: group['id'],
  name: group['nazwa']
});

// Helpers
function convertXMLToJSON(rawXML) {
  return JSON.parse(xml2json.toJson(rawXML));
}

function handleError(error, statusCode, location, callback) {
  if (error || statusCode !== 200) {
    console.error(location, error);
    callback(null, error);
  }
}

function compareOnlyDates(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDay() === date2.getDay()
  );
}

function timeDifference(time1, time2) {
  return new Date(time1).getTime() - new Date(time2).getTime();
}

function createTimestamp(date, time) {
  return new Date(`${date}T${time}`);
}

module.exports = router;
