"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_builder_1 = require("../s3.builder");
describe('S3HostingBuilder', function () {
    describe('build function', function () {
        it('should build a hosting service', function (done) {
            // GIVEN
            // WHEN
            var hostingService = new s3_builder_1.S3Builder()
                .withBucketName('toto')
                .asHostingService()
                .build();
            // THEN
            expect(hostingService).not.toBeNull();
            expect(hostingService.constructor.name).toEqual('S3HostingService');
            done();
        });
    });
});
//# sourceMappingURL=s3-hosting.builder.spec.js.map