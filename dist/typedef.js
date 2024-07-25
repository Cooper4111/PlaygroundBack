"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrCode = void 0;
var ErrCode;
(function (ErrCode) {
    ErrCode[ErrCode["default"] = 0] = "default";
    ErrCode[ErrCode["defaultDBerr"] = 1] = "defaultDBerr";
    ErrCode[ErrCode["userMissing"] = 2] = "userMissing";
    ErrCode[ErrCode["errorVerifyingUser"] = 3] = "errorVerifyingUser";
    ErrCode[ErrCode["emptyDB"] = 4] = "emptyDB";
    ErrCode[ErrCode["alreadyRegistered"] = 5] = "alreadyRegistered";
    ErrCode[ErrCode["JWT_UNDEFINED"] = 6] = "JWT_UNDEFINED";
    ErrCode[ErrCode["JWT_EXPIRED"] = 7] = "JWT_EXPIRED";
    ErrCode[ErrCode["JWT_LOGGED_OUT"] = 8] = "JWT_LOGGED_OUT";
    ErrCode[ErrCode["NOT_ENOUGH_PRIV"] = 9] = "NOT_ENOUGH_PRIV";
    ErrCode[ErrCode["InvalidSQL"] = 10] = "InvalidSQL";
})(ErrCode || (exports.ErrCode = ErrCode = {}));
//# sourceMappingURL=typedef.js.map