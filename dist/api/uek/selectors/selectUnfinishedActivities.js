"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectUnfinishedActivites = (activites, datetime) => activites.filter((activity) => new Date(activity.date + 'T' + activity.endTime).getTime() > datetime.getTime());
//# sourceMappingURL=selectUnfinishedActivities.js.map