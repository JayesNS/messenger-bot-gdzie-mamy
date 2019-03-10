"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_1 = require("../api");
class ApiRoutes {
    constructor(api) {
        this.router = express_1.Router();
        this.api = api;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get('/', (req, res) => {
            res.send('API');
        });
        this.router.get('/groups/:groupId/activity/:offset(current|next)/:datetime?', (req, res) => {
            this.getActivityByGroupId(req, res);
        });
        this.router.get('/groups/:groupId/schedule/:datetime?', (req, res) => this.getScheduleByGroupIdRoute(req, res));
        this.router.get('/groups/:groupName/:groupsLimit?', (req, res) => this.getGroupByNameRoute(req, res));
        this.router.get('/groups', (req, res) => this.getAllGroupsRoute(req, res));
    }
    getActivityByGroupId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupId = req.params.groupId;
            const dateParam = req.params.datetime;
            const datetime = dateParam ? new Date(dateParam) : undefined;
            const offset = req.params.offset === 'current' ? api_1.TimeOffset.CURRENT : api_1.TimeOffset.NEXT;
            const activity = yield this.api.getActivityByGroupId(groupId, offset, datetime);
            res.send(activity);
        });
    }
    getAllGroupsRoute(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield this.api.getAllGroups();
            res.send(groups);
        });
    }
    getGroupByNameRoute(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupName = decodeURIComponent(req.params.groupName);
            const groups = yield this.api.getGroupsByName(groupName);
            res.send(groups);
        });
    }
    getScheduleByGroupIdRoute(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupId = req.params.groupId;
            const dateParam = req.params.datetime;
            const datetime = dateParam ? new Date(dateParam) : undefined;
            const fullSchedule = yield this.api.getScheduleByGroupId(groupId, datetime);
            res.send(fullSchedule);
        });
    }
}
exports.ApiRoutes = ApiRoutes;
//# sourceMappingURL=ApiRoutes.js.map