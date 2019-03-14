"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const port = process.env.PORT || 1337;
App_1.default.listen(port, error => {
    if (error) {
        return console.log({ error });
    }
    return console.log(`Server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map