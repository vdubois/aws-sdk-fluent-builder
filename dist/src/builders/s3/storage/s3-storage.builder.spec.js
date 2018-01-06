"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_builder_1 = require("../s3.builder");
describe('S3StorageBuilder', function () {
    describe('build function', function () {
        it('should build a storage service', function (done) {
            // GIVEN
            // WHEN
            var storageService = new s3_builder_1.S3Builder()
                .withBucketName('toto')
                .asStorageService()
                .build();
            // THEN
            expect(storageService).not.toBeNull();
            expect(storageService.constructor.name).toEqual('S3StorageService');
            done();
        });
    });
});
//# sourceMappingURL=s3-storage.builder.spec.js.map