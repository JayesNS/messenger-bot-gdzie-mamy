import { Router } from 'express';
import { Api, TimeOffset } from '../api';
import { Group, Activity } from '../models';
import { Request, Response } from 'express-serve-static-core';

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
    this.router.get(
      '/groups/:groupId/activity/:offset(current|next)',
      (req: Request, res: Response) => {
        this.getActivityByGroupId(req, res);
      }
    );
    this.router.get('/groups/:groupId/schedule/:datetime?', (req: Request, res: Response) =>
      this.getScheduleByGroupIdRoute(req, res)
    );
    this.router.get('/groups/:groupName/:groupsLimit?', (req: Request, res: Response) =>
      this.getGroupByNameRoute(req, res)
    );
    this.router.get('/groups', (req: Request, res: Response) => this.getAllGroupsRoute(req, res));
  }

  private async getActivityByGroupId(req: Request, res: Response): Promise<void> {
    const groupId: number = req.params.groupId;
    const offset: TimeOffset =
      req.params.offset === 'current' ? TimeOffset.CURRENT : TimeOffset.NEXT;
    const activity: Activity = await this.api.getActivityByGroupId(groupId, offset);
    res.send(activity);
  }
  private async getAllGroupsRoute(req: Request, res: Response): Promise<void> {
    const groups: Group[] = await this.api.getAllGroups();
    res.send(groups);
  }

  private async getGroupByNameRoute(req: Request, res: Response): Promise<void> {
    const groupName: string = decodeURIComponent(req.params.groupName);
    const groups: Group[] = await this.api.getGroupsByName(groupName);
    res.send(groups);
  }

  private async getScheduleByGroupIdRoute(req: Request, res: Response): Promise<void> {
    const groupId: number = req.params.groupId;
    const dateParam: any = req.params.datetime;
    const datetime: Date = dateParam ? new Date(dateParam) : undefined;
    const fullSchedule: Activity[] = await this.api.getScheduleByGroupId(groupId, datetime);
    res.send(fullSchedule);
  }
}
