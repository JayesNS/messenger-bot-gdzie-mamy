import { Router } from 'express';
import { Api } from '../api';
import { Group } from '../models';

export class ApiRoutes {
  public router: Router;
  private api: Api;

  constructor(api: Api) {
    this.router = Router();
    this.api = api;

    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/', (req, res) => {
      res.send('API');
    });
    this.router.get('/groups', (req, res) => this.getAllGroupsRoute(req, res));
    this.router.get('/groups/:groupName/:groupsLimit?', (req, res) =>
      this.getGroupByNameRoute(req, res)
    );
    this.router.get('/group/:groupId/schedule/:datetime?', (req, res) =>
      this.getScheduleByGroupIdRoute(req, res)
    );
  }

  private getAllGroupsRoute(req, res): void {
    this.api
      .getAllGroups()
      .then((groups: Group[]) => {
        res.send(groups);
      })
      .catch(error => {
        console.error({ error });
      });
  }

  private getGroupByNameRoute(req, res): void {
    const groupName = decodeURIComponent(req.params.groupName);
    this.api
      .getGroupsByName(groupName)
      .then((groups: Group[]) => {
        res.send(groups);
      })
      .catch(error => {
        console.error({ error });
      });
  }

  private getScheduleByGroupIdRoute(req, res): void {
    res.send('Get groups schedule');
  }
}

/* router.get('/groups/:groupName/:groupsLimit?', (req, res) => {
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
  */
