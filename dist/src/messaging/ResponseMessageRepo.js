"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_map_1 = require("typescript-map");
const util_1 = require("util");
const response_messages_1 = require("./response-messages");
class ResponseMessageRepo {
    constructor() {
        this.responseMessages = new typescript_map_1.TSMap();
        this.addMultipleResponses([
            new response_messages_1.HowCanIHelpYou(),
            new response_messages_1.NotConfigured(),
            new response_messages_1.FindSchedule(),
            new response_messages_1.Configure(),
            new response_messages_1.HandleGroupSelection(),
            new response_messages_1.NoLectures(),
            new response_messages_1.TryShowActivities(),
            new response_messages_1.FindActivity(),
            new response_messages_1.FindNextActivity()
        ]);
    }
    getResponseKeys() {
        return this.responseMessages.keys();
    }
    addMultipleResponses(responses) {
        responses.forEach((response) => this.addResponse(response));
    }
    addResponse(response) {
        if (!this.responseMessages.has(response.id)) {
            this.responseMessages.set(response.id, response);
        }
    }
    getResponseById(id) {
        return this.responseMessages.get(id);
    }
    getResponseByTrigger(trigger) {
        const testTriggerByArray = (triggeredBy) => triggeredBy.map((trigger) => trigger.toLowerCase()).includes(trigger.toLowerCase());
        const testTriggerByFunction = (triggeredBy) => triggeredBy(trigger.toLowerCase());
        const findMatchingTrigger = ({ triggeredBy }) => util_1.isArray(triggeredBy) ? testTriggerByArray(triggeredBy) : testTriggerByFunction(triggeredBy);
        const response = this.responseMessages.values().find(findMatchingTrigger);
        return response;
    }
}
exports.ResponseMessageRepo = ResponseMessageRepo;
//# sourceMappingURL=ResponseMessageRepo.js.map