import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from 'express';
import bodyParser from 'body-parser';
import { DBController } from './db';
import * as path from 'path';
import { opResult, opError, ErrCode, User } from "./typedef";
import { SETTINGS } from './settings';
import * as bcrypt from 'bcrypt';
import multer from 'multer';
import { nanoid } from 'nanoid';

const DB : DBController = DBController.instance;

async function veryfyUser(request) : Promise<opResult<User>> {
    console.log('Cheking JWT');
    const JWT = request.cookies[SETTINGS.JWT_NAME];
    console.log(JWT);
    console.log(request.cookies);
    if(JWT === 'logout')
        return { ok : 0, error: { code: ErrCode.JWT_LOGGED_OUT, desc: 'You have logged out. Please, log in again.' } };
    if(JWT === undefined){
        return { ok : 0, error: { code: ErrCode.JWT_UNDEFINED, desc: 'JWT undefined'} };
    }
    try {
        const JWT_decoded = jwt.verify(JWT, SETTINGS.JWT_SECRET);
        console.log("CP_vU_2");
        console.log(JWT_decoded);
        const user : User = (JWT_decoded as any).user;
        return { ok: 1, data: user }
    } catch (e) {
        console.log("CP_vU_3ex");
        var error = { code: 0, desc: 'Error verifying user: ' + e.message };
        if(e.name === 'TokenExpiredError')
            error = { code: ErrCode.JWT_EXPIRED, desc: 'Token expired' };
        console.log(e);
        console.log("CP_vU_4ex");
        return { ok : 0, error: error };
    }
}

const indexPath   = '/';
const accountPath = '/account';
const peoplePath  = '/people';
const authPath    = '/auth';


export function initUIendpoints(app) {
    app.use(cookieParser());
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
    app.use('/', express.static(path.join(__dirname, '../frontend')));
    
    app.use('/denied', async (request, response) => {
        response.status(403).sendFile(path.join(__dirname, '../frontend/403.html'));
    });
}

export function initAPIendpoints(app) {
    app.use(cors({
        origin      : [ SETTINGS.ROOT_URL, `http://127.0.0.1:${SETTINGS.UI_PORT}` ], // Sets Access-Control-Allow-Origin to the UI URI
        credentials : true,                  // Sets Access-Control-Allow-Credentials to true
    }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(bodyParser.json());
    app.get('/api/test', async (request, response) => {
        var foo = { ok: 1 };
        response.status(200).json(foo);
    });


//================================================================================

    // +
    app.get('/api/whoami', async (request, response) => { // /api/whoami
        const res = await veryfyUser(request);
        if(!res.ok)
            return response.status(403).json(res);
        console.log(res);
        delete res.data.password;
        delete res.data._id;
        return response.status(200).json({ ok : 1, data: res.data });
    });

    // +
    app.post('/api/login', async (request, response) => {
        const res = await DB.authUser(request.body.user.email, request.body.user.password);
        if(res.error)
            return response.status(401).json(res);
        delete res.data.password;
        console.log('Signing JWT payload...:');
        console.log(res);
        const JWT = jwt.sign({
                user: res.data,
                exp:  Math.floor(Date.now() + SETTINGS.JWT_MAX_AGE) / 1000 // JWT requires seconds!
            },
            SETTINGS.JWT_SECRET);
        response.cookie(SETTINGS.JWT_NAME, JWT, {
            maxAge: SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true, // may need 'false' for localhost testing
        });
        return response.status(200).json({ ok : 1 });
    });

    // +
    app.get('/api/logout', async (request, response) => {
        response.cookie(SETTINGS.JWT_NAME, 'logout', {
            maxAge: SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true,
        });
        return response.status(200).json({ ok : 1, data : 'Logout successfully.' });
    });

    // +
    app.post('/api/user/create', async (request, response) => {
        console.log('Register EP fired');
        const user : User = request.body.user;
        const resGetUser = await DB.getUser(user.email);
        if(resGetUser.ok)
            return response.status(400).json({ ok : 0, error: `User with email ${user.email} exists` });
        if(resGetUser.error.code == ErrCode.defaultDBerr)
            return response.status(400).json(resGetUser);
        // TODO check user's fields for correctness
        user.password = await bcrypt.hash(user.password, SETTINGS.SALT_ROUNDS);
        return response.status(200).json(await DB.createUser(user));
    });
    app.post('/api/user/update', async (request, response) => {
        console.log('Edit EP fired');

        const resVerify = await veryfyUser(request);
        if(!resVerify.ok)
            return response.status(403).json(resVerify);
        const user : User = resVerify.data;
        const updateData  = request.body.user;
        console.log(user);
        console.log(updateData);
        const resCheckUser = await DB.getUser(user.email);
        if(!resCheckUser.ok)
            return response.status(resCheckUser.error.code == ErrCode.userMissing ? 401 : 500).json(resCheckUser);
        for(const field in updateData)
            if(!updateData[field])
                delete updateData[field];
        console.log('================');
        console.log(updateData);
        // TODO check user's fields for correctness
        updateData.email = user.email;
        if(updateData.password)
            updateData.password = await bcrypt.hash(updateData.password, SETTINGS.SALT_ROUNDS);
        return response.status(200).json(await DB.updateUser(updateData));
    });

    // +
    app.get('/api/user/list', async (request, response) => {
        const resVerify = await veryfyUser(request);
        if(!resVerify.ok)
            return response.status(403).json(resVerify);
        const resList = await DB.listUsers();
        if(!resList.ok)
            return response.status(403).json(resList);
        resList.data.map( record => {
            delete record._id;
            delete record.password;
        });
        return response.status(200).json(resList);
    });

    app.post('/api/upload', async (request, response) => {
        const resVerify = await veryfyUser(request);
        if(!resVerify.ok)
            return response.status(403).json(resVerify);
        request.avatarID = resVerify.data.avatarID;
        upload(request, response, (err) => {
            if(err)
                response.status(400).json({ message: err });
            else 
                if(request.file == undefined)
                    response.status(400).json({ message: 'No file selected' });
                else
                    response.status(200).json({
                        message: 'File uploaded successfully',
                        file: `uploads/${request.file.filename}`
                    });
        });
    });
    return app;
}

//=========== UPLOAD =============

const storage = multer.diskStorage({
    destination: SETTINGS.PATH_TO_MEDIA,
    filename: function(req, file, callback){
        callback(null, (req as any)?.avatarID + path.extname(file.originalname)); // callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
  
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function(req, file, callback){
        checkFileType(file, callback);
    }
}).single('avatar');

function checkFileType(file, callback){
    const filetypes = /jpeg|jpg|png/;
    const extname   = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype  = filetypes.test(file.mimetype);
    if(mimetype && extname)
        return callback(null, true);
    else
        callback('Error: Images Only!');
}