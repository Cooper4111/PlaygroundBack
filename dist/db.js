"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBController = void 0;
const mongodb_1 = require("mongodb");
const settings_1 = require("./settings");
const typedef_1 = require("./typedef");
const bcrypt = __importStar(require("bcrypt"));
const nanoid_1 = require("nanoid");
class DBController {
    constructor() {
        console.log('Creating new DB instance...');
        this.connect();
    }
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    connect() {
        return __awaiter(this, arguments, void 0, function* (URL = settings_1.SETTINGS.DFLT_MONGO_URL, DBname = settings_1.SETTINGS.DFLT_MONGO_DB, collectionName = settings_1.SETTINGS.DFLT_MONGO_COLLECTION) {
            this.mongoClient = new mongodb_1.MongoClient(URL);
            this.userCollection = this.mongoClient.db(DBname).collection(collectionName);
        });
    }
    listUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.userCollection.find().toArray();
                if (res.length != 0)
                    return { ok: 1, data: res };
                return { ok: 0, error: { code: typedef_1.ErrCode.emptyDB, desc: `User DB is empty'`, meta: res } };
            }
            catch (e) {
                return { ok: 0, error: { code: typedef_1.ErrCode.defaultDBerr, desc: `Error listing users`, meta: e } };
            }
        });
    }
    getUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.userCollection.find({ 'email': email }).toArray();
                if (res.length != 0)
                    return { ok: 1, data: res[0] };
                return { ok: 0, error: { code: typedef_1.ErrCode.userMissing, desc: `No user with email '${email}'`, meta: res } };
            }
            catch (e) {
                return { ok: 0, error: { code: typedef_1.ErrCode.defaultDBerr, desc: `Error getting user '${email}' from DB.`, meta: e } };
            }
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // does user exists? Yes. Here.
            // is data correct? Nope. Outside.
            try {
                user.avatarID = (0, nanoid_1.nanoid)();
                const res = yield this.userCollection.insertOne(user);
                return { ok: res.acknowledged ? 1 : 0, data: { uid: res.insertedId, pwd: user.password } };
            }
            catch (e) {
                return { ok: 0, error: { desc: `Error registering user: ${user.email} ${user.password}`, meta: e } };
            }
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const setFields = {};
                if (user.password)
                    setFields.password = user.password;
                if (user.fname)
                    setFields.fname = user.fname;
                if (user.lname)
                    setFields.lname = user.lname;
                console.log(`updating ${user.email}`);
                const res = yield this.userCollection.updateOne({ email: user.email }, { $set: setFields });
                return { ok: res.acknowledged ? 1 : 0, data: res };
            }
            catch (e) {
                return { ok: 0, error: { desc: `Error updating user: ${user.email}`, meta: e } };
            }
        });
    }
    deleteUser(email) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    authUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRes = yield this.getUser(email);
            console.log("userRes:");
            console.log(userRes);
            if (!userRes.ok)
                return userRes;
            const userAtDB = userRes.data;
            return bcrypt.compare(password, userAtDB.password)
                .then(res => {
                console.log('res: ' + res);
                if (res)
                    return { ok: 1, data: userAtDB };
                else
                    return { ok: 0, error: { desc: 'Wrong login/password' } };
            })
                .catch(err => { return { ok: 0, error: { desc: 'bcrypt compare() error', meta: err } }; });
        });
    }
}
exports.DBController = DBController;
//# sourceMappingURL=db.js.map