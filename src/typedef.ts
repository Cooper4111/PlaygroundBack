export interface opResult<T> {
    ok:  1 | 0,
    data?: T,
    error?: opError
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

export interface opError {
    code? : ErrCode,
    desc? : string,
    meta? : any
}

export interface User {
    email     : string,
    password? : string,
    passHash?  : string,
    sex?      : string,
    age?      : number,
    picPath?  : string,
    fname?    : string,
    sname?    : string,
    secret?   : string,
}