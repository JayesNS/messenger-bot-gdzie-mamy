'use strict';

const express = require('express'),
  router = express.Router(),
  request = require('request'),
  xml2json = require('xml2json');

const { Helpers } = require('../classes');

const apiUrl = 'http://planzajec.uek.krakow.pl';

router.get('/groups', (req, res) => {
  fetchGroupList(selectOnlyGroups)
    .then(groups => {
      sendJSON(res, groups);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});
router.get('/groups/:groupName/:notMoreGroupsThan?', (req, res) => {
  const NOT_MORE_GROUPS_THAN = 3;
  // If groups length passes this number, API will send empty array
  const notMoreGroupsThan = req.params.notMoreGroupsThan || NOT_MORE_GROUPS_THAN;
  const groupName = decodeURIComponent(req.params.groupName);

  fetchGroupList(selectMatchingGroups, groupName)
    .then(groups => {
      const limitedGroups = groups.length > notMoreGroupsThan ? [] : groups;

      sendJSON(res, limitedGroups);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});
router.get('/plans/:groupId', (req, res) => {
  const groupId = req.params.groupId;

  fetchSchedule(groupId, selectLectures)
    .then(lectures => {
      sendJSON(res, lectures);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});
router.get('/plans/:groupId/today/next/:time?', (req, res) => {
  const groupId = req.params.groupId;
  const currentTime = req.params.time;

  fetchSchedule(createUrlToSchedule(groupId), selectNextLecture, new Date(currentTime))
    .then(lecture => {
      sendJSON(res, lecture);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});

router.get('/plans/:groupId/today/:time?', (req, res) => {
  const groupId = req.params.groupId;
  const currentTime = req.params.time;

  fetchSchedule(groupId, selectTodaysLectures, new Date(currentTime))
    .then(lectures => {
      sendJSON(res, lectures);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});

function getJSONFromUrl(url, selector, selectorData) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error, response.statusCode);
      }

      const data = convertXMLToJSON(body);
      resolve(selector ? selector(data, selectorData) : data);
    });
  });
}

function fetchGroupList(selector, selectorData) {
  return getJSONFromUrl(createUrlToGroupList(), selector, selectorData);
}
function fetchSchedule(groupId, selector, selectorData) {
  return getJSONFromUrl(createUrlToSchedule(groupId), selector, selectorData);
}

// Selectors
const selectOnlyGroups = data => data['plan-zajec']['zasob'].map(parseGroup);
const selectMatchingGroups = (groups, groupName) =>
  selectOnlyGroups(groups).filter(group => filterLowercaseToIncludes(group.name, groupName));
const selectLectures = data =>
  new Array()
    .concat(data['plan-zajec']['zajecia'])
    .filter(filterNotEmpty)
    .map(parseSchedule);
const selectTodaysLectures = (data, time) =>
  selectLectures(data).filter(lecture => Helpers.compareOnlyDates(time, lecture.date));
const selectNextLecture = (data, time) =>
  selectLectures(data)
    .map(lecture => ({
      ...lecture,
      queryDateTime: time,
      minutesToLecture: Helpers.timeDifferenceInMinutes(
        Helpers.createTimestamp(lecture.date, lecture.startTime),
        time || new Date()
      )
    }))
    .filter(lecture => {
      const ALLOWED_LATENESS_IN_MINUTES = 30;
      return lecture.minutesToLecture > -ALLOWED_LATENESS_IN_MINUTES;
    })[0] || {};

// URLs
const createUrlToGroupList = () => `${apiUrl}?typ=G&xml`;
const createUrlToSchedule = groupId => `${apiUrl}?typ=G&id=${groupId}&okres=4&xml`;

// Filters
const filterNotEmpty = value => (value ? true : false);
const filterLowercaseToIncludes = (sourceValue, valueToFind) =>
  sourceValue.toLowerCase().includes(valueToFind.toLowerCase());

// Parsers
const parseGroup = group => ({
  id: group['id'],
  name: group['nazwa']
});
const parseSchedule = activity => ({
  date: activity['termin'],
  startTime: activity['od-godz'],
  endTime: activity['do-godz'],
  name: Helpers.returnNullIfObjectEmpty(activity['przedmiot']),
  type: Helpers.returnNullIfObjectEmpty(activity['typ']),
  lecturer: activity['nauczyciel'] ? activity['nauczyciel']['$t'] : null,
  room: Helpers.returnNullIfObjectEmpty(activity['sala'])
});

const convertXMLToJSON = rawXML => JSON.parse(xml2json.toJson(rawXML));

const handleRequestError = (res, predicate) => {
  if (predicate) {
    res.status(503).send(error);
  }
};
const handleError = (error, statusCode, location) =>
  new Promise(resolve => {
    if (error || statusCode !== 200) {
      console.error(location, error);
      resolve(error);
    }
  });

function sendJSON(res, json) {
  res.status(200).json(json);
}
function apiLog(...messages) {
  console.log('[API]', ...messages);
}

module.exports = router;
