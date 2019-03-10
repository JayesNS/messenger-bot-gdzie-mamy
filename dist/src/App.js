"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const routes_1 = require("./routes");
const api_1 = require("./api");
class App {
    constructor() {
        this.express = express().use(bodyParser.json());
        this.mountRoutes();
    }
    mountRoutes() {
        const router = express.Router();
        router.get('/', (req, res) => {
            res.send('Hello World');
        });
        router.use('/api', new routes_1.ApiRoutes(new api_1.UekApi()).router);
        router.use('/webhook', new routes_1.WebhookRoutes().router);
        this.express.use(router);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map