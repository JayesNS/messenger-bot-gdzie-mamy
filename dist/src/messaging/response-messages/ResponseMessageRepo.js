"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_map_1 = require("typescript-map");
class ResponseMessageRepo {
    constructor() {
        this.responseMessages = new typescript_map_1.TSMap();
    }
    getResponseByName(name) {
        return this.responseMessages.get(name);
    }
}
exports.ResponseMessageRepo = ResponseMessageRepo;
//# sourceMappingURL=ResponseMessageRepo.js.map