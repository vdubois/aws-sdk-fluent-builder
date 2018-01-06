"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var S3 = require("aws-sdk/clients/s3");
var s3_storage_service_1 = require("./s3-storage.service");
describe('S3StorageService', function () {
    describe('listFiles function', function () {
        it('should get an empty list if aws sdk return no files', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: function () { return Promise.resolve({ Contents: [] }); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.listFiles()
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual([]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get one file if aws sdk returns one file', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: function () { return Promise.resolve({ Contents: [{ Key: 'test.file' }] }); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.listFiles()
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files.length).toEqual(1);
                expect(files[0]).toEqual('test.file');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get one file if aws sdk returns multiple files but we provide a predicate', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: function () { return Promise.resolve({ Contents: [{ Key: 'test.file' }, { Key: 'test2.txt' }] }); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.listFiles(function (file) { return file.endsWith('.txt'); })
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files.length).toEqual(1);
                expect(files[0]).toEqual('test2.txt');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should throw an error if aws sdk throws an error', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: function () { return Promise.reject('Error when listing files'); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.listFiles()
                .then(function (files) {
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            })
                .catch(function (exception) {
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('listFiles function : Error when listing files');
                done();
            });
            // THEN
        });
    });
    describe('readFile function', function () {
        it('should load file contents when load file from aws sdk works fine', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: 'content' }); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.readFile('test.txt')
                .then(function (content) {
                // THEN
                expect(content).not.toBeNull();
                expect(content).toEqual('content');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should throw an error when load file from aws sdk thrown an error', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.reject('read error'); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.readFile('test.txt')
                .then(function (content) {
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('readFile function : read error');
                done();
            });
        });
    });
    describe('writeFile function', function () {
        it('should write file contents when upload from aws sdk works fine', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.writeFile('test.txt', new Buffer('content'))
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should throw an error if aws sdk throws an error', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.reject('write error'); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.writeFile('path.txt', new Buffer('content'))
                .then(function () {
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('writeFile function : write error');
                done();
            });
        });
    });
    describe('deleteFile function', function () {
        it('should throw an error if aws sdk throws an error', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'deleteObject').and.returnValue({
                promise: function () { return Promise.reject('delete error'); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.deleteFile('test.txt')
                .then(function () {
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('deleteFile function : delete error');
                done();
            });
        });
        it('should delete file with a call to aws sdk', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'deleteObject').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.deleteFile('test.txt')
                .then(function () {
                // THEN
                expect(mockedS3.deleteObject).toHaveBeenCalledTimes(1);
                expect(mockedS3.deleteObject).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'test.txt'
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('copyFile function', function () {
        it('should throw an error if aws sdk throws an error', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'copyObject').and.returnValue({
                promise: function () { return Promise.reject('copy error'); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.copyFile('test.txt', 'test2.txt')
                .then(function () {
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('copyFile function : copy error');
                done();
            });
        });
        it('should throw an error if source and destination have same paths', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'copyObject').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.copyFile('test.txt', 'test.txt')
                .then(function () {
                fail('we should not reach here because an error must have been thrown');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual('copyFile function : source and destination must have different paths');
                done();
            });
        });
        it('should copy file with a call to aws sdk', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'copyObject').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var storageService = new s3_storage_service_1.S3StorageService('toto', false, mockedS3);
            // WHEN
            storageService.copyFile('test.txt', 'test2.txt')
                .then(function () {
                // THEN
                expect(mockedS3.copyObject).toHaveBeenCalledTimes(1);
                expect(mockedS3.copyObject).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    CopySource: 'toto/test.txt',
                    Key: 'test2.txt'
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
});
//# sourceMappingURL=s3-storage.service.spec.js.map