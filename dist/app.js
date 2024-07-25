"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_1 = require("./settings");
const endpoints_1 = require("./endpoints");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const UIapp = (0, express_1.default)();
        const APIapp = (0, express_1.default)();
        (0, endpoints_1.initAPIendpoints)(APIapp);
        (0, endpoints_1.initUIendpoints)(UIapp);
        APIapp.listen(4000, () => { console.log(`API is listening @ 127.0.0.1:${settings_1.SETTINGS.API_PORT}`); });
        UIapp.listen(3000, () => { console.log(`UI  is listening @ 127.0.0.1:${settings_1.SETTINGS.UI_PORT}`); });
    });
}
init();
// process.on("SIGINT", async() => {
//     await mongoClient.close();
//     console.log("Приложение завершило работу");
//     process.exit();
// });
//# sourceMappingURL=app.js.map