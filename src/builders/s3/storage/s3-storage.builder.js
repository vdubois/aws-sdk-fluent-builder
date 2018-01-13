"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_storage_service_1 = require("../../../repositories/s3/s3-storage.service");
class S3StorageBuilder {
    constructor(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
    }
    build() {
        return new s3_storage_service_1.S3StorageService(this.bucketName, this.mustCreateBeforeUse);
    }
}
exports.S3StorageBuilder = S3StorageBuilder;
