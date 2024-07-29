export interface opResult<T> {
    ok:  number | boolean,
    data?: T,
    error?: opError
}
export interface opError {
    code? : ErrCode,
    desc? : string,
    meta? : any
}
export enum ErrCode {
    default = 0,
    defaultDBerr,
    userMissing,
    errorVerifyingUser,
    emptyDB,
    alreadyRegistered,
    JWT_UNDEFINED,
    JWT_EXPIRED,
    JWT_LOGGED_OUT,
    NOT_ENOUGH_PRIV,
    InvalidSQL
}



export interface User {
    email     : string,
    password? : string,
    _id       : string,
    passHash? : string,
    sex?      : string,
    age?      : number,
    dob?      : string,
    avatarID? : string,
    fname?    : string,
    sname?    : string,
    secret?   : string,
}