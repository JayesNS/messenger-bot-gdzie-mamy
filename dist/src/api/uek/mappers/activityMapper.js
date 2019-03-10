"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../../models");
exports.activityMapper = (activity) => new models_1.Activity().deserialize({
    date: activity['termin'],
    startTime: activity['od-godz'],
    endTime: activity['do-godz'],
    name: activity['przedmiot'],
    type: activity['typ'],
    person: activity['nauczyciel'] ? activity['nauczyciel']['$t'] : null,
    place: activity['sala']
});
//# sourceMappingURL=activityMapper.js.map