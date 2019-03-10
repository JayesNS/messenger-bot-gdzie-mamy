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
const FindActivity_1 = require("./FindActivity");
class FindNextActivity {
    constructor() {
        this.id = 'FIND_LATER_LECTURE';
        this.triggeredBy = text => new RegExp('(następni?e)|(później)|(potem)|(zaraz)').test(text);
        this.create = (payload) => __awaiter(this, void 0, void 0, function* () { return new FindActivity_1.FindActivity().create(Object.assign({}, payload, { offset: 'next' })); });
    }
}
exports.FindNextActivity = FindNextActivity;
//# sourceMappingURL=FindNextActivity.js.map