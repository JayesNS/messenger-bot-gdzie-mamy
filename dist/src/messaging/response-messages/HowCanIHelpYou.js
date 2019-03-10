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
const messages_1 = require("../messages");
class HowCanIHelpYou {
    constructor() {
        this.id = 'HOW_CAN_I_HELP_YOU';
        this.triggeredBy = [];
        this.create = () => __awaiter(this, void 0, void 0, function* () {
            return new messages_1.TextMessage('Tu Gdzie Mamy. Jak mogę pomóc?', [
                new messages_1.QuickReply('Gdzie mamy?'),
                new messages_1.QuickReply('Skonfiguruj')
            ]);
        });
    }
}
exports.HowCanIHelpYou = HowCanIHelpYou;
//# sourceMappingURL=HowCanIHelpYou.js.map