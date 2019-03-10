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
const _1 = require(".");
const FindSchedule_1 = require("./FindSchedule");
class TryShowActivities {
    constructor() {
        this.id = 'TRY_SHOW_ACTIVITES';
        this.triggeredBy = text => new RegExp('((gdzie|co) ?mamy)|(gdziemamy)', '').test(text);
        this.create = (payload) => __awaiter(this, void 0, void 0, function* () {
            const sender = payload.sender;
            if (sender.hasGroups()) {
                return yield new FindSchedule_1.FindSchedule().create({ sender, message: payload.message });
            }
            else {
                return yield new _1.NotConfigured().create();
            }
        });
    }
}
exports.TryShowActivities = TryShowActivities;
//# sourceMappingURL=TryShowActivites.js.map