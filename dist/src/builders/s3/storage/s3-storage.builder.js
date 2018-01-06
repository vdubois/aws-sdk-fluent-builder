"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_storage_service_1 = require("../../../repositories/s3/s3-storage.service");
var S3StorageBuilder = /** @class */ (function () {
    function S3StorageBuilder(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
    }
    S3StorageBuilder.prototype.build = function () {
        return new s3_storage_service_1.S3StorageService(this.bucketName, this.mustCreateBeforeUse);
    };
    return S3StorageBuilder;
}());
exports.S3StorageBuilder = S3StorageBuilder;
//# sourceMappingURL=s3-storage.builder.js.map