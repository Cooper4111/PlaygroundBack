"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS = exports.SERVER_ROOT_URI = exports.UI_ROOT_URI = void 0;
exports.UI_ROOT_URI = '';
exports.SERVER_ROOT_URI = '';
exports.SETTINGS = {
    COOKIE_NAME: 'XP_auth_JWT',
    DB_USER: 'postgres',
    DB_PASS: 'bealSbRWuJ0EVMhXa7iYaiQhS',
    DB_NAME: 'extension',
    SALT_ROUNDS: 10,
    JWT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'exterminatus', // TODO: environment var
    JWT_NAME: 'XP_Token',
    JWT_MAX_AGE: (1000 * 60 * 60) * 24, // 24h
    UI_PORT: 3000,
    API_PORT: 4000,
    ROOT_URL: 'http://localhost:3000',
    PATH_TO_MEDIA: '',
    DFLT_MONGO_URL: 'mongodb://127.0.0.1:27017/',
    DFLT_MONGO_DB: 'xpart',
    DFLT_MONGO_COLL: 'users'
};
//# sourceMappingURL=settings.js.map