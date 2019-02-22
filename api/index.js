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
router.get('/groups/:groupName/:groupsLimit?', (req, res) => {
  const GROUPS_LIMIT = 3;
  const groupsLimit = req.params.groupsLimit || GROUPS_LIMIT;
  const groupName = decodeURIComponent(req.params.groupName);

  fetchGroupList(selectMatchingGroups, groupName)
    .then(groups => {
      const limitedGroups = groups.length > groupsLimit ? [] : groups;

      sendJSON(res, limitedGroups);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});
router.get('/group/:groupId/schedule/:datetime?', (req, res) => {
  const groupId = req.params.groupId;
  const datetime = new Date(Date.parse(req.params.datetime) || Date.now());

  fetchSchedule(groupId, selectLecturesFromDate, { datetime })
    .then(lectures => {
      sendJSON(res, lectures);
    })
    .catch((error, statusCode) => {
      handleRequestError(res, error || statusCode);
    });
});
router.get('/group/:groupId/lecture/:offset(nearest|later)/:datetime?', (req, res) => {
  const groupId = req.params.groupId;
  const offset = req.params.offset;
  const datetime = new Date(Date.parse(req.params.datetime) || Date.now());

  fetchSchedule(groupId, selectNextLectureFromDate, {
    datetime,
    numberOfLecture: offset === 'later' ? 1 : 0
  })
    .then(lecture => {
      sendJSON(res, lecture);
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
const selectLectures = data => {
  return new Array()
    .concat(data['plan-zajec']['zajecia'])
    .filter(filterNotEmpty)
    .map(parseActivity);
};
const selectLecturesFromDate = (data, { datetime }) =>
  selectLectures(data).filter(lecture => {
    return Helpers.compareOnlyDates(datetime, lecture.date);
  });
const selectNextLectureFromDate = (data, { datetime, numberOfLecture }) => {
  return (
    selectLecturesFromDate(data, { datetime })
      .map((lecture, index) => {
        return {
          ...lecture,
          queryDateTime: datetime,
          minutesToStart: Helpers.timeDifferenceInMinutes(
            Helpers.createTimestamp(lecture.date, lecture.startTime),
            datetime || new Date()
          ),
          activityIndexToday: index + 1
        };
      })
      .filter(lecture => {
        const ALLOWED_LATENESS = 70;
        return lecture.minutesToStart > -ALLOWED_LATENESS;
      })[numberOfLecture] || {}
  );
};

// URLs
const createUrlToGroupList = () => `${apiUrl}?typ=G&xml`;
const createUrlToSchedule = groupId => `${apiUrl}?typ=G&id=${groupId}&okres=3&xml`;

// Filters
const filterNotEmpty = value => (value ? true : false);
const filterLowercaseToIncludes = (sourceValue, valueToFind) =>
  sourceValue.toLowerCase().includes(valueToFind.toLowerCase());

// Parsers
const parseGroup = group => ({
  id: group['id'],
  name: group['nazwa']
});
const parseActivity = activity => ({
  date: activity['termin'],
  startTime: activity['od-godz'],
  endTime: activity['do-godz'],
  name: Helpers.returnNullIfObjectEmpty(activity['przedmiot']),
  type: Helpers.returnNullIfObjectEmpty(activity['typ']),
  person: activity['nauczyciel'] ? activity['nauczyciel']['$t'] : null,
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
