'use strict';

const express = require('express'),
  router = express.Router(),
  request = require('request'),
  xml2json = require('xml2json');

const apiUrl = 'http://planzajec.uek.krakow.pl';

router.get('/groups', (req, res) => {
  fetchGroupList(selectOnlyGroups, null, (groups, error) => {
    handleRequestError(res, error);

    sendJSON(res, groups);
  });
});
router.get('/groups/:groupName', (req, res) => {
  const NUMBER_OF_SUGGESTED_GROUPS = 5;
  const groupName = req.params.groupName;
  fetchGroupList(selectMatchingGroups, groupName, (groups, error) => {
    handleRequestError(res, error);

    apiLog(groups);

    sendJSON(res, groups.length > NUMBER_OF_SUGGESTED_GROUPS ? [] : groups);
  });
});
router.get('/plans/:groupId', (req, res) => {
  const groupId = req.params.groupId;

  fetchSchedule(groupId, selectLectures, null, (lectures, error) => {
    handleRequestError(res, error);

    sendJSON(res, lectures);
  });
});
router.get('/plans/:groupId/today', (req, res) => {
  const groupId = req.params.groupId;

  fetchSchedule(groupId, selectTodaysLectures, null, (lectures, error) => {
    handleRequestError(res, error);

    sendJSON(res, lectures);
  });
});
router.get('/plans/:groupId/today/next/:time?', (req, res) => {
  const groupId = req.params.groupId;
  const currentTime = req.params.time;

  fetchSchedule(
    createUrlToSchedule(groupId),
    selectNextLecture,
    currentTime,
    (lecture, error) => {
      handleRequestError(res, error);

      sendJSON(res, lecture);
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

function fetchGroupList(selector, selectorData, callback) {
  getJSONFromUrl(createUrlToGroupList(), selector, selectorData, callback);
}
function fetchSchedule(groupId, selector, selectorData, callback) {
  getJSONFromUrl(
    createUrlToSchedule(groupId),
    selector,
    selectorData,
    callback
  );
}

// Selectors
const selectOnlyGroups = data =>
  data['plan-zajec']['zasob'].map(group => parseGroup(group));
const selectMatchingGroups = (groups, groupName) =>
  selectOnlyGroups(groups).filter(group =>
    group.name.toLowerCase().includes(groupName.toLowerCase())
  );
const selectLectures = data => {
  return [].concat(data['plan-zajec']['zajecia']);
};
const selectTodaysLectures = data =>
  selectLectures(data).filter(lecture =>
    compareOnlyDates(new Date(), lecture['termin'])
  );
const selectNextLecture = (data, time) =>
  selectTodaysLectures(data)
    .map(lecture => ({
      ...lecture,
      timeToLecture: timeDifference(
        createTimestamp(lecture['termin'], lecture['do-godz']),
        time || new Date()
      )
    }))
    .filter(lecture => lecture.timeToLecture > 0)[0] || {};

// URLs
const createUrlToGroupList = () => `${apiUrl}?typ=G&xml`;
const createUrlToSchedule = groupId =>
  `${apiUrl}?typ=G&id=${groupId}&okres=1&xml`;

// Parsers
const parseGroup = group => ({
  id: group['id'],
  name: group['nazwa']
});
// TODO: Add schedule parser

// Helpers
const convertXMLToJSON = rawXML => {
  return JSON.parse(xml2json.toJson(rawXML));
};

const handleRequestError = (res, predicate) => {
  if (predicate) {
    res.status(503).send(error);
  }
};
const handleError = (error, statusCode, location, callback) => {
  if (error || statusCode !== 200) {
    console.error(location, error);
    callback(null, error);
  }
};

const compareOnlyDates = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDay() === date2.getDay()
  );
};
const timeDifference = (time1, time2) => {
  return (new Date(time1).getTime() - new Date(time2).getTime()) / 1000 / 60;
};
const createTimestamp = (date, time) => {
  return new Date(`${date}T${time}`);
};

function sendJSON(res, json) {
  res.status(200).json(json);
}
function apiLog(...messages) {
  console.log('[GdzieMamy? API]', ...messages);
}

module.exports = router;
