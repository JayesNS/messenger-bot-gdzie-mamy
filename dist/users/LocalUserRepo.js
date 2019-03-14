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
const fs = require("fs");
const typescript_map_1 = require("typescript-map");
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const LOCAL_DATA_PATH = './data/users.json';
class LocalUserRepo {
    constructor(localDataPath = LOCAL_DATA_PATH) {
        this.localDataPath = localDataPath;
        this.users = new typescript_map_1.TSMap();
        this.load();
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
    hasUser(userId) {
        return !!this.users.has(userId);
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasUser(userId)) {
                return this.users.get(userId);
            }
            else {
                return yield this.saveUser(new models_1.User(userId));
            }
        });
    }
    saveUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            this.users.set(user.id, user);
            yield this.save();
            return user;
        });
    }
    save() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.localDataPath, JSON.stringify(this.users.toJSON()), 'utf-8', (err) => {
                if (err) {
                    reject(err);
                }
                resolve(this.users);
            });
        });
    }
    load() {
        return new Promise((resolve, reject) => {
            fs.exists(this.localDataPath, (exists) => {
                if (!exists) {
                    reject();
                }
                fs.readFile(this.localDataPath, 'utf-8', (err, data) => {
                    if (err || !data) {
                        reject(err);
                    }
                    const jsonData = helpers_1.Helpers.parse(data);
                    this.users = new typescript_map_1.TSMap();
                    Object.values(jsonData).forEach(user => this.saveUser(new models_1.User().deserialize(user)));
                    resolve(this.users);
                });
            });
        });
    }
}
exports.LocalUserRepo = LocalUserRepo;
//# sourceMappingURL=LocalUserRepo.js.map