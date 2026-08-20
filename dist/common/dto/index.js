"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get ApiErrorItem () {
        return _responsedto.ApiErrorItem;
    },
    get ErrorCode () {
        return _responsedto.ErrorCode;
    },
    get ErrorResponse () {
        return _responsedto.ErrorResponse;
    },
    get MetaWithPagination () {
        return _responsedto.MetaWithPagination;
    },
    get PaginatedResponse () {
        return _responsedto.PaginatedResponse;
    },
    get PaginationDto () {
        return _paginationdto.PaginationDto;
    },
    get PaginationMeta () {
        return _responsedto.PaginationMeta;
    },
    get STATUS_TO_ERROR_CODE () {
        return _responsedto.STATUS_TO_ERROR_CODE;
    },
    get SuccessResponse () {
        return _responsedto.SuccessResponse;
    }
});
const _paginationdto = require("./pagination.dto");
const _responsedto = require("./response.dto");

//# sourceMappingURL=index.js.map