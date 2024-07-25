import * as bcrypt from 'bcrypt';
import { SETTINGS } from './settings';
import { DBController } from './db';
import { User } from './typedef';

const DB = DBController.instance;

export async function validateUser(user: User) {
    // chech if email is present;
    const hash = 'get it from db';
    return bcrypt.compare(user.password, hash)
            .then(  res => { return { ok: 1, data:  res } })
            .catch( err => { return { ok: 0, error: err } });
}

export async function registerUser(userObj) {
    // chech if email is present already;
    const passHash = await bcrypt.hash(userObj.password, SETTINGS.SALT_ROUNDS)
    // write to DB
}
