"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../../helpers");
exports.selectActivitiesFromDate = (activites, datetime) => activites.filter((activity) => helpers_1.Helpers.compareOnlyDates(new Date(activity.date), datetime));
//# sourceMappingURL=selectActivitiesFromDate.js.map