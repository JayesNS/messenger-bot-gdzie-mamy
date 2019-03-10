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
const config_1 = require("../../config");
const helpers_1 = require("../helpers");
class SendApi {
    sendMessage(recipient, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.makeRequestToMessengerApi(recipient, message);
        });
    }
    makeRequestToMessengerApi(recipient, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield helpers_1.Helpers.makeRequest({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: config_1.ACCESS_TOKEN },
                method: 'POST',
                json: Object.assign({ recipient }, message)
            });
        });
    }
}
exports.SendApi = SendApi;
//# sourceMappingURL=SendApi.js.map