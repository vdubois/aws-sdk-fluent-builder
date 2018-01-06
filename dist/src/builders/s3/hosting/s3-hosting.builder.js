"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_hosting_service_1 = require("../../../repositories/s3/s3-hosting.service");
var S3HostingBuilder = /** @class */ (function () {
    function S3HostingBuilder(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
    }
    S3HostingBuilder.prototype.build = function () {
        return new s3_hosting_service_1.S3HostingService(this.bucketName, this.mustCreateBeforeUse);
    };
    return S3HostingBuilder;
}());
exports.S3HostingBuilder = S3HostingBuilder;
//# sourceMappingURL=s3-hosting.builder.js.map