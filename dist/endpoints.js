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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUIendpoints = initUIendpoints;
exports.initAPIendpoints = initAPIendpoints;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const path = __importStar(require("path"));
const typedef_1 = require("./typedef");
const settings_1 = require("./settings");
const bcrypt = __importStar(require("bcrypt"));
const DB = db_1.DBController.instance;
function veryfyUser(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const JWT = request.cookies[settings_1.SETTINGS.JWT_NAME];
        console.log(JWT);
        if (JWT === 'logout')
            return { ok: 0, error: { code: typedef_1.ErrCode.JWT_LOGGED_OUT, desc: 'You have logged out. Please, log in again.' } };
        if (JWT === undefined) {
            return { ok: 0, error: { code: typedef_1.ErrCode.JWT_UNDEFINED, desc: 'JWT undefined' } };
        }
        try {
            const JWT_decoded = jsonwebtoken_1.default.verify(JWT, settings_1.SETTINGS.JWT_SECRET);
            console.log("CP_vU_2");
            const user = JWT_decoded.user;
            return { ok: 1, data: user };
        }
        catch (e) {
            console.log("CP_vU_3ex");
            var error = { code: 0, desc: 'Error verifying user: ' + e.message };
            if (e.name === 'TokenExpiredError')
                error = { code: typedef_1.ErrCode.JWT_EXPIRED, desc: 'Token expired' };
            console.log(e);
            console.log("CP_vU_4ex");
            return { ok: 0, error: error };
        }
    });
}
const indexPath = '/';
const accountPath = '/account';
const peoplePath = '/people';
const authPath = '/auth';
function initUIendpoints(app) {
    app.use((0, cookie_parser_1.default)());
    // app.use( async (request, response, next) => {
    //     if(request._parsedUrl.pathname in { '/auth':0, '/auth.html':0 } ) {
    //         return next();
    //     }
    //     const JWT = request.cookies[SETTINGS.JWT_NAME];
    //     // console.log('http://' + SETTINGS.ROOT_URL + indexPath);
    //     console.log('CP_0');
    //     if(JWT === undefined && !(request._parsedUrl.pathname in { '/auth':0, '/auth.html':0 }))
    //         return response.redirect('http://localhost:3000/auth.html');
    //         // return response.status(401).sendFile(path.join(__dirname, '../frontend/auth.html'));
    //     console.log('CP_1');
    //     console.log(JWT);
    //     try {
    //         console.log('CP_2');
    //         const user = jwt.verify(JWT, SETTINGS.JWT_SECRET);
    //         console.log(user);
    //         console.log('CP_3');
    //         next();
    //     } catch (e) {
    //         response.status(500).sendFile(path.join(__dirname, '../frontend/500.html'));
    //     }
    // });
    app.use('/', express_1.default.static(path.join(__dirname, '../frontend')));
    app.use('/denied', (request, response) => __awaiter(this, void 0, void 0, function* () {
        response.status(403).sendFile(path.join(__dirname, '../frontend/403.html'));
    }));
}
function initAPIendpoints(app) {
    app.use((0, cors_1.default)({
        origin: [settings_1.SETTINGS.ROOT_URL], // Sets Access-Control-Allow-Origin to the UI URI
        credentials: true, // Sets Access-Control-Allow-Credentials to true
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use(body_parser_1.default.json());
    app.get('/api/test', (request, response) => __awaiter(this, void 0, void 0, function* () {
        var foo = { ok: 1 };
        response.status(200).json(foo);
    }));
    app.get('/api/whoami', (request, response) => __awaiter(this, void 0, void 0, function* () {
        console.log('Cheking JWT');
        const res = yield veryfyUser(request);
        if (!res.ok)
            return response.status(403).json({ ok: 0, error: res.error });
        delete res.data.password;
        return response.status(200).json({ ok: 1, data: res.data });
    }));
    //========================================
    app.post('/api/login', (request, response) => __awaiter(this, void 0, void 0, function* () {
        const res = yield DB.authUser(request.body.user.email, request.body.user.password);
        if (res.error)
            return response.status(401).json(res);
        delete res.data.password;
        const JWT = jsonwebtoken_1.default.sign({
            user: res.data.user,
            exp: Math.floor(Date.now() + settings_1.SETTINGS.JWT_MAX_AGE) / 1000 // JWT requires seconds!
        }, settings_1.SETTINGS.JWT_SECRET);
        response.cookie(settings_1.SETTINGS.JWT_NAME, JWT, {
            maxAge: settings_1.SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true, // may need 'false' for localhost testing
        });
        return response.status(200).json({ ok: 1 });
    }));
    app.get('/api/logout', (request, response) => __awaiter(this, void 0, void 0, function* () {
        response.cookie(settings_1.SETTINGS.JWT_NAME, 'logout', {
            maxAge: settings_1.SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true,
        });
        return response.status(200).json({ ok: 1, data: 'Logout successfully.' });
    }));
    app.post('/api/user/create', (request, response) => __awaiter(this, void 0, void 0, function* () {
        console.log('Register EP fired');
        const user = request.body.user;
        const resGetUser = yield DB.getUser(user.email);
        if (resGetUser.ok)
            return response.status(400).json({ ok: 0, error: `User with email ${user.email} exists` });
        if (resGetUser.error.code == typedef_1.ErrCode.defaultDBerr)
            return response.status(400).json(resGetUser);
        // check user for correctness
        user.password = yield bcrypt.hash(user.password, settings_1.SETTINGS.SALT_ROUNDS);
        return response.status(200).json(yield DB.createUser(user));
    }));
    app.get('/api/user/list', (request, response) => __awaiter(this, void 0, void 0, function* () {
        console.log('Cheking JWT');
        const resVerify = yield veryfyUser(request);
        if (!resVerify.ok)
            return response.status(403).json({ ok: 0, error: resVerify.error });
        return response.status(200).json(yield DB.listUsers());
    }));
    // CRUD
    // app.post('/api/user/get', async (request, response) => { // (email) : User
    //     try{
    //         const authRes = await veryfyUser(request, Role.manager); // access for manager+ only
    //         if(!authRes.ok)
    //             return response.status(403).json(authRes);
    //         const res = await DB.getUser(request.body.email, true);
    //         if(!res.ok)
    //             return response.status(500).json(res);
    //         const user : User = res.data;
    //         if(Role[authRes.data.role] !== Role.admin &&
    //                         user.company !== authRes.data.company)
    //             return response.status(403).json({ ok: 0, error: 'Forbidden.'});
    //         return response.status(200).json(user);
    //     }
    //     catch(e){
    //         return response.status(500).json({ ok: 0, error: { desc: 'Something went wrong.', meta: e}});
    //     }
    // });
    // app.post('/api/user/list', async (request, response) => { // ({role, company}) : [User]
    //     try{
    //         // reqWhitelist()  or even app.use(...)?
    //         const reqComp = request.body.company;
    //         const reqRole = request.body.role;
    //         const authRes = await veryfyUser(request, Role.manager);
    //         if(!authRes.ok)
    //             return response.status(403).json(authRes);
    //         const user    = authRes.data;
    //         const isAdmin = Role[user.role] === Role.admin;
    //         if(!isAdmin && reqComp !== user.company)
    //             return response.status(403).json({ ok: 0, error: { desc: `You have no access to company ${request.body.company}; Your current accecible companies: ${authRes.data.company}` }});
    //         if(reqRole && !reqComp && !isAdmin)
    //             return response.status(403).json({ ok: 0, error: { desc: `You are not authorized to list ALL users.` }});
    //         const uList = await DB.listUser(reqComp, reqRole);
    //         return response.status(200).json(uList);
    //     }
    //     catch(e){
    //         return response.status(500).json({ ok: 0, error: { desc: 'Something went wrong.', meta: e}});
    //     }
    // });
    // app.post('/api/user/delete', async (request, response) => {
    //     console.log('Delete EP fired');
    //     const authRes = await veryfyUser(request, Role.manager);
    //     if(!authRes.ok)
    //         return response.status(403).json(authRes);
    //     console.log('Delete EP: veryfied.');
    //     const findRes = await DB.getUser(request.body.email, true);
    //     if(!findRes.ok)
    //         return response.status(403).json(findRes);
    //     console.log('Delete EP: target found.');
    //     const reqUser = authRes.data;
    //     const delUser = findRes.data;
    //     if(Role[reqUser.role] <= Role[delUser.role] ||
    //         (Role[reqUser.role] != Role.admin && reqUser.company !== delUser.company))
    //         return response.status(403).json({ ok: 0, error: 'You have not enough privileges to delete this user.'});
    //     console.log('Delete EP: target accepted.');
    //     const delRes = await DB.deleteUser(delUser.email);
    //     return response.status(delRes.ok? 200 : 500).json(delRes);
    // });
    // //TODO
    // app.post('/api/user/update', async (request, response) => {
    //     const authRes = await veryfyUser(request, Role.manager);
    //     if(!authRes.ok)
    //         return response.status(403).json(authRes);
    //     const user : User = request.body.user;
    // });
    return app;
}
//# sourceMappingURL=endpoints.js.map