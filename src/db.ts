import { Collection, MongoClient } from 'mongodb';
import { SETTINGS } from './settings';
import { ErrCode, opError, opResult, User } from './typedef';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export class DBController
{

    mongoClient     : MongoClient;
    userCollection  : Collection<Document>;

    private static _instance: DBController;

    private constructor(){
        console.log('Creating new DB instance...');
        this.connect();
    }

    public static get instance(){
        return this._instance || (this._instance = new this());
    }

    async connect(
        URL             = SETTINGS.DFLT_MONGO_URL,
        DBname          = SETTINGS.DFLT_MONGO_DB,
        collectionName  = SETTINGS.DFLT_MONGO_COLLECTION
    ){
        this.mongoClient = new MongoClient(URL);
        this.userCollection = this.mongoClient.db(DBname).collection(collectionName);
    }

    async listUsers() : Promise<opResult<any>> {
        try {
            const res = await this.userCollection.find().toArray();
            if(res.length != 0)
                return { ok: 1, data: res };
            return { ok: 0, error: { code: ErrCode.emptyDB, desc: `User DB is empty'`, meta : res } };
        } catch (e) {
            return { ok: 0, error: { code: ErrCode.defaultDBerr, desc: `Error listing users`, meta: e } };
        }
    }

    async getUser(email : string) : Promise<opResult<any>> {
        try {
            const res = await this.userCollection.find({ 'email' : email }).toArray();
            if(res.length != 0)
                return { ok: 1, data: res[0] };
            return { ok: 0, error: { code: ErrCode.userMissing, desc: `No user with email '${email}'`, meta : res } };
        } catch (e) {
            return { ok: 0, error: { code: ErrCode.defaultDBerr, desc: `Error getting user '${email}' from DB.`, meta: e } };
        }
    }

    async createUser(user : any) : Promise<opResult<any>> {
        // does user exists? Yes. Here.
        // is data correct? Nope. Outside.
        try {
            user.avatarID = nanoid();
            const res = await this.userCollection.insertOne(user);
            return { ok: res.acknowledged ? 1 : 0, data: { uid : res.insertedId, pwd: user.password }  };
        } catch (e) {
            return { ok: 0, error: { desc: `Error registering user: ${user.email} ${user.password}`, meta: e } };
        }
    }
    async updateUser(user : any) : Promise<opResult<any>> {
        try {
            const setFields : any = {};
            if(user.password) setFields.password = user.password;
            if(user.fname)    setFields.fname    = user.fname;
            if(user.lname)    setFields.lname    = user.lname;
            console.log(`updating ${user.email}`);
            const res = await this.userCollection.updateOne(
                { email : user.email },
                { $set  : setFields }
            );
            return { ok: res.acknowledged ? 1 : 0, data: res };
        } catch (e) {
            return { ok: 0, error: { desc: `Error updating user: ${user.email}`, meta: e } };
        }
    }

    async deleteUser(email : string) {}

    async authUser(email : string, password : string) : Promise<opResult<any>> {
        const userRes = await this.getUser(email);
        console.log("userRes:");
        console.log(userRes);
        if(!userRes.ok)
            return userRes;
        const userAtDB = userRes.data;
        return bcrypt.compare(password, userAtDB.password)
            .then(  res => { 
                console.log('res: ' + res);
                if(res)
                    return { ok: 1, data: userAtDB } 
                else
                    return { ok: 0, error: { desc: 'Wrong login/password' } } 
                })
            .catch( err => { return { ok: 0, error: { desc: 'bcrypt compare() error', meta: err } } });
    }
}