"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOnlyLectures = (data) => new Array()
    .concat(data['plan-zajec']['zajecia'])
    .filter(activity => activity['typ'] !== 'Przeniesienie zajęć');
//# sourceMappingURL=selectOnlyLectures.js.map