"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_hosting_service_1 = require("./s3-hosting.service");
var S3 = require("aws-sdk/clients/s3");
describe('S3HostingService', function () {
    describe('uploadFilesFromDirectory function', function () {
        it('should throw an error if directory to copy does not exist', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory('/my/directory')
                .then(function () {
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).toEqual('uploadFilesFromDirectory function : directory does not exist');
                done();
            });
        });
        it('should throw an error if given path is not a directory', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory/test.txt")
                .then(function () {
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).toEqual("uploadFilesFromDirectory function : " + __dirname + "/../../../spec/data/directory/test.txt"
                    + ' is not a directory');
                done();
            });
        });
        it('should throw an error if given destination path starts with a separator', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory", '/subdir')
                .then(function () {
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).toEqual("uploadFilesFromDirectory function : destination path should not start with a '/'");
                done();
            });
        });
        it('should throw an error if given destination path does not end with a separator', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory", 'subdir/subdir2')
                .then(function () {
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).toEqual("uploadFilesFromDirectory function : destination path should end with a '/'");
                done();
            });
        });
        it('should throw an error if aws sdk returns an error', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.reject('upload error'); }
            });
            spyOn(mockedS3, 'putBucketPolicy').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketWebsite').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory")
                .then(function () {
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('uploadFilesFromDirectory function : upload error');
                done();
            });
        });
        it('should upload files with a call to aws sdk if there are no errors', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketPolicy').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketWebsite').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory")
                .then(function () {
                // THEN
                expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'subdirectory/test3.txt',
                    Body: new Buffer('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'test.txt',
                    Body: new Buffer('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'test2.txt',
                    Body: new Buffer('data')
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should upload files to a subdirectory with a call to aws sdk if there are no errors', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketPolicy').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketWebsite').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', false, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory", 'mySubdir1/mySubdir2/')
                .then(function () {
                // THEN
                expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2/subdirectory/test3.txt',
                    Body: new Buffer('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2/test.txt',
                    Body: new Buffer('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2/test2.txt',
                    Body: new Buffer('data')
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should set the bucket type to website hosting', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'createBucket').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketPolicy').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedS3, 'putBucketWebsite').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var hostingService = new s3_hosting_service_1.S3HostingService('toto', true, mockedS3);
            // WHEN
            hostingService.uploadFilesFromDirectory(__dirname + "/../../../spec/data/directory", 'mySubdir1/mySubdir2/')
                .then(function () {
                // THEN
                expect(mockedS3.createBucket).toHaveBeenCalledTimes(1);
                expect(mockedS3.putBucketPolicy).toHaveBeenCalledTimes(1);
                expect(mockedS3.putBucketWebsite).toHaveBeenCalledTimes(1);
                expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
});
//# sourceMappingURL=s3-hosting.service.spec.js.map