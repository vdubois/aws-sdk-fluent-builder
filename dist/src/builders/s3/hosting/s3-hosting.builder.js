"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_hosting_service_1 = require("../../../repositories/s3/s3-hosting.service");
class S3HostingBuilder {
    constructor(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
    }
    build() {
        return new s3_hosting_service_1.S3HostingService(this.bucketName, this.mustCreateBeforeUse);
    }
}
exports.S3HostingBuilder = S3HostingBuilder;
