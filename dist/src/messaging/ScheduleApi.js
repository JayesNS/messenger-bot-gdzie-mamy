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
const helpers_1 = require("../helpers");
class ScheduleApi {
    constructor(serverDatetime) {
        ScheduleApi.serverDatetime = serverDatetime ? serverDatetime : new Date();
        this.url = 'http://localhost:1337/api';
    }
    getMatchingGroups(groupName) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.url}/groups/${encodeURIComponent(groupName)}/5`;
            const data = yield helpers_1.Helpers.makeRequest({ uri: url });
            return helpers_1.Helpers.parse(data);
        });
    }
    getActivites(groupId, datetime = new Date()) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.url}/groups/${groupId}/schedule/${encodeURIComponent(datetime.toUTCString())}`;
            const data = yield helpers_1.Helpers.makeRequest({ uri: url });
            return helpers_1.Helpers.parse(data);
        });
    }
    getActivity(groupId, offset = 'current', datetime = new Date()) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.url}/groups/${groupId}/activity/${offset}/${encodeURIComponent(datetime.toUTCString())}`;
            const data = yield helpers_1.Helpers.makeRequest({ uri: url });
            console.log({ url, data });
            return data ? helpers_1.Helpers.parse(data) : null;
        });
    }
}
exports.ScheduleApi = ScheduleApi;
//# sourceMappingURL=ScheduleApi.js.map