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
const mappers_1 = require("./mappers");
const selectors_1 = require("./selectors");
const activityMapper_1 = require("./mappers/activityMapper");
const helpers_1 = require("../../helpers");
class UekApi {
    constructor() {
        this.apiUrl = 'http://planzajec.uek.krakow.pl';
    }
    getAllGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.apiUrl}?typ=G&xml`;
            const data = yield this.getJSONFromUrl(url);
            const rawGroups = selectors_1.selectOnlyGroups(data);
            const groups = rawGroups.map(mappers_1.groupMapper);
            return groups;
        });
    }
    /**
     * @param threshold Defines how narrow group amount should be.
     * If groups length is greater than treshold,
     * function will return empty array which means that too many groups have been found
     */
    getGroupsByName(groupName, threshold = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield this.getAllGroups();
            const matchingGroups = selectors_1.selectMatchingGroups(groups, groupName);
            return matchingGroups.length < threshold ? matchingGroups : [];
        });
    }
    getFullScheduleByGroupName(groupName) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getFullScheduleByGroupId(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.apiUrl}?typ=G&id=${groupId}&okres=3&xml`;
            const data = yield this.getJSONFromUrl(url);
            const rawLectures = selectors_1.selectOnlyLectures(data);
            const lectures = rawLectures.map(activityMapper_1.activityMapper);
            return lectures;
        });
    }
    getScheduleByGroupId(groupId, datetime = new Date()) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullSchedule = yield this.getFullScheduleByGroupId(groupId);
            const activitiesFromDate = selectors_1.selectActivitiesFromDate(fullSchedule, datetime);
            return activitiesFromDate;
        });
    }
    getActivityByGroupId(groupId, timeOffset, datetime) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield this.getScheduleByGroupId(groupId, datetime);
            const activities = selectors_1.selectUnfinishedActivites(schedule, new Date());
            return activities[timeOffset];
        });
    }
    getJSONFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield helpers_1.Helpers.makeRequest({ uri: url });
            return JSON.parse(helpers_1.Helpers.convertXmlToJsonString(data));
        });
    }
}
exports.UekApi = UekApi;
//# sourceMappingURL=UekApi.js.map