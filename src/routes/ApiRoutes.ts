import { Router } from 'express';
import { Api } from '../api';
import { Group, Activity } from '../models';
import { json } from 'body-parser';

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
    this.router.get('/groups/:groupId/schedule/:datetime?', (req, res) =>
      this.getScheduleFromDateByGroupIdRoute(req, res)
    );
    this.router.get('/groups', (req, res) => this.getAllGroupsRoute(req, res));
    this.router.get('/groups/:groupName/:groupsLimit?', (req, res) =>
      this.getGroupByNameRoute(req, res)
    );
  }

  private async getAllGroupsRoute(req, res): Promise<void> {
    const groups: Group[] = await this.api.getAllGroups();
    res.send(groups);
  }

  private async getGroupByNameRoute(req, res): Promise<void> {
    const groupName: string = decodeURIComponent(req.params.groupName);
    const groups: Group[] = await this.api.getGroupsByName(groupName);
    res.send(groups);
  }

  private async getScheduleFromDateByGroupIdRoute(req, res): Promise<void> {
    const groupId: number = req.params.groupId;
    const dateParam = req.params.datetime;
    const datetime: Date = dateParam ? new Date(dateParam) : undefined;
    const fullSchedule: Activity[] = await this.api.getScheduleFromDateByGroupId(groupId, datetime);
    res.send(fullSchedule);
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
