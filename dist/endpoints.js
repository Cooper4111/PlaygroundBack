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
const multer_1 = __importDefault(require("multer"));
const DB = db_1.DBController.instance;
function veryfyUser(request) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Cheking JWT');
        const JWT = request.cookies[settings_1.SETTINGS.JWT_NAME];
        console.log(JWT);
        console.log(request.cookies);
        if (JWT === 'logout')
            return { ok: 0, error: { code: typedef_1.ErrCode.JWT_LOGGED_OUT, desc: 'You have logged out. Please, log in again.' } };
        if (JWT === undefined) {
            return { ok: 0, error: { code: typedef_1.ErrCode.JWT_UNDEFINED, desc: 'JWT undefined' } };
        }
        try {
            const JWT_decoded = jsonwebtoken_1.default.verify(JWT, settings_1.SETTINGS.JWT_SECRET);
            console.log("CP_vU_2");
            console.log(JWT_decoded);
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
        origin: [settings_1.SETTINGS.ROOT_URL, `http://127.0.0.1:${settings_1.SETTINGS.UI_PORT}`], // Sets Access-Control-Allow-Origin to the UI URI
        credentials: true, // Sets Access-Control-Allow-Credentials to true
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use(body_parser_1.default.json());
    app.get('/api/test', (request, response) => __awaiter(this, void 0, void 0, function* () {
        var foo = { ok: 1 };
        response.status(200).json(foo);
    }));
    //================================================================================
    // +
    app.get('/api/whoami', (request, response) => __awaiter(this, void 0, void 0, function* () {
        const res = yield veryfyUser(request);
        if (!res.ok)
            return response.status(403).json(res);
        console.log(res);
        delete res.data.password;
        delete res.data._id;
        return response.status(200).json({ ok: 1, data: res.data });
    }));
    // +
    app.post('/api/login', (request, response) => __awaiter(this, void 0, void 0, function* () {
        const res = yield DB.authUser(request.body.user.email, request.body.user.password);
        if (res.error)
            return response.status(401).json(res);
        delete res.data.password;
        console.log('Signing JWT payload...:');
        console.log(res);
        const JWT = jsonwebtoken_1.default.sign({
            user: res.data,
            exp: Math.floor(Date.now() + settings_1.SETTINGS.JWT_MAX_AGE) / 1000 // JWT requires seconds!
        }, settings_1.SETTINGS.JWT_SECRET);
        response.cookie(settings_1.SETTINGS.JWT_NAME, JWT, {
            maxAge: settings_1.SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true, // may need 'false' for localhost testing
        });
        return response.status(200).json({ ok: 1 });
    }));
    // +
    app.get('/api/logout', (request, response) => __awaiter(this, void 0, void 0, function* () {
        response.cookie(settings_1.SETTINGS.JWT_NAME, 'logout', {
            maxAge: settings_1.SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true,
        });
        return response.status(200).json({ ok: 1, data: 'Logout successfully.' });
    }));
    // +
    app.post('/api/user/create', (request, response) => __awaiter(this, void 0, void 0, function* () {
        console.log('Register EP fired');
        const user = request.body.user;
        const resGetUser = yield DB.getUser(user.email);
        if (resGetUser.ok)
            return response.status(400).json({ ok: 0, error: `User with email ${user.email} exists` });
        if (resGetUser.error.code == typedef_1.ErrCode.defaultDBerr)
            return response.status(400).json(resGetUser);
        // TODO check user's fields for correctness
        user.password = yield bcrypt.hash(user.password, settings_1.SETTINGS.SALT_ROUNDS);
        return response.status(200).json(yield DB.createUser(user));
    }));
    app.post('/api/user/update', (request, response) => __awaiter(this, void 0, void 0, function* () {
        console.log('Edit EP fired');
        const resVerify = yield veryfyUser(request);
        if (!resVerify.ok)
            return response.status(403).json(resVerify);
        const user = resVerify.data;
        const updateData = request.body.user;
        console.log(user);
        console.log(updateData);
        const resCheckUser = yield DB.getUser(user.email);
        if (!resCheckUser.ok)
            return response.status(resCheckUser.error.code == typedef_1.ErrCode.userMissing ? 401 : 500).json(resCheckUser);
        for (const field in updateData)
            if (!updateData[field])
                delete updateData[field];
        console.log('================');
        console.log(updateData);
        // TODO check user's fields for correctness
        updateData.email = user.email;
        if (updateData.password)
            updateData.password = yield bcrypt.hash(updateData.password, settings_1.SETTINGS.SALT_ROUNDS);
        return response.status(200).json(yield DB.updateUser(updateData));
    }));
    // +
    app.get('/api/user/list', (request, response) => __awaiter(this, void 0, void 0, function* () {
        const resVerify = yield veryfyUser(request);
        if (!resVerify.ok)
            return response.status(403).json(resVerify);
        const resList = yield DB.listUsers();
        if (!resList.ok)
            return response.status(403).json(resList);
        resList.data.map(record => {
            delete record._id;
            delete record.password;
        });
        return response.status(200).json(resList);
    }));
    app.post('/api/upload', (request, response) => __awaiter(this, void 0, void 0, function* () {
        const resVerify = yield veryfyUser(request);
        if (!resVerify.ok)
            return response.status(403).json(resVerify);
        request.avatarID = resVerify.data.avatarID;
        upload(request, response, (err) => {
            if (err)
                response.status(400).json({ message: err });
            else if (request.file == undefined)
                response.status(400).json({ message: 'No file selected' });
            else
                response.status(200).json({
                    message: 'File uploaded successfully',
                    file: `uploads/${request.file.filename}`
                });
        });
    }));
    return app;
}
//=========== UPLOAD =============
const storage = multer_1.default.diskStorage({
    destination: settings_1.SETTINGS.PATH_TO_MEDIA,
    filename: function (req, file, callback) {
        callback(null, (req === null || req === void 0 ? void 0 : req.avatarID) + path.extname(file.originalname)); // callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function (req, file, callback) {
        checkFileType(file, callback);
    }
}).single('avatar');
function checkFileType(file, callback) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname)
        return callback(null, true);
    else
        callback('Error: Images Only!');
}
//# sourceMappingURL=endpoints.js.map