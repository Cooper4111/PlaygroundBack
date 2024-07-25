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

const DB : DBController = DBController.instance;

async function veryfyUser(request) : Promise<opResult<User>> {
    const JWT = request.cookies[SETTINGS.JWT_NAME];
    console.log(JWT);
    if(JWT === 'logout')
        return { ok : 0, error: { code: ErrCode.JWT_LOGGED_OUT, desc: 'You have logged out. Please, log in again.' } };
    if(JWT === undefined){
        return { ok : 0, error: { code: ErrCode.JWT_UNDEFINED, desc: 'JWT undefined'} };
    }
    try {
        const JWT_decoded = jwt.verify(JWT, SETTINGS.JWT_SECRET);
        console.log("CP_vU_2");
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
        origin      : [ SETTINGS.ROOT_URL ], // Sets Access-Control-Allow-Origin to the UI URI
        credentials : true,                  // Sets Access-Control-Allow-Credentials to true
    }));
    
    app.use(cookieParser());
    app.use(express.json());
    app.use(bodyParser.json());

    app.get('/api/test', async (request, response) => {
        var foo = { ok: 1 };
        response.status(200).json(foo);
    });

    app.get('/api/whoami', async (request, response) => { // /api/whoami
        console.log('Cheking JWT')
        const res = await veryfyUser(request);
        if(!res.ok)
            return response.status(403).json({ ok: 0, error: res.error });
        delete res.data.password;
        return response.status(200).json({ ok : 1, data: res.data });
    });

//========================================

    app.post('/api/login', async (request, response) => {
        const res = await DB.authUser(request.body.user.email, request.body.user.password);
        if(res.error)
            return response.status(401).json(res);
        delete res.data.password;
        const JWT = jwt.sign({
                user: res.data.user,
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

    app.get('/api/logout', async (request, response) => {
        response.cookie(SETTINGS.JWT_NAME, 'logout', {
            maxAge: SETTINGS.JWT_MAX_AGE,
            httpOnly: true,
            secure: true,
        });
        return response.status(200).json({ ok : 1, data : 'Logout successfully.' });
    });

    app.post('/api/user/create', async (request, response) => {
        console.log('Register EP fired');
        const user : User = request.body.user;
        const resGetUser = await DB.getUser(user.email);
        if(resGetUser.ok)
            return response.status(400).json({ ok : 0, error: `User with email ${user.email} exists` });
        if(resGetUser.error.code == ErrCode.defaultDBerr)
            return response.status(400).json(resGetUser);
        // check user for correctness
        user.password = await bcrypt.hash(user.password, SETTINGS.SALT_ROUNDS);
        return response.status(200).json(await DB.createUser(user));
    });

    app.get('/api/user/list', async (request, response) => { // /api/whoami
        console.log('Cheking JWT');
        const resVerify = await veryfyUser(request);
        if(!resVerify.ok)
            return response.status(403).json({ ok: 0, error: resVerify.error });
        return response.status(200).json(await DB.listUsers());
    });

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