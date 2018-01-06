"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_configuration_service_1 = require("./s3-configuration.service");
var S3 = require("aws-sdk/clients/s3");
describe('S3ConfigurationService', function () {
    describe('get function', function () {
        it('should get a value from configuration', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({ key: 'value' })) }); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.get('key')
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            })
                .catch(function (exception) {
                expect(exception).toBeNull();
                done();
            });
        });
        it('should get a value from an overriden configuration', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({ key: 'value' })) }); }
            });
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', { we: "don't care" }, false, mockedS3);
            // WHEN
            configurationService.get('key')
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                expect(mockedS3.upload).toHaveBeenCalledTimes(1);
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'config.json',
                    Body: JSON.stringify({ we: "don't care" }, null, 2)
                });
                done();
            })
                .catch(function (exception) {
                expect(exception).toBeNull();
                done();
            });
        });
        it('should throw an error if a key does not exist', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({})) }); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.get('key')
                .then(function (value) {
                expect(value).toBeNull();
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual("No key 'key' present in configuration");
                done();
            });
        });
        it('should load remote file just one time when requesting keys', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({ key: 'value' })) }); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.get('key')
                .then(function () { return configurationService.get('key'); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            })
                .catch(function (exception) {
                expect(exception).toBeNull();
                done();
            });
        });
        it('should throw an error if file does not exist in bucket', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.reject({}); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.get('key')
                .then(function () { return configurationService.get('key'); })
                .then(function (value) {
                // THEN
                fail('we should never reach here because config file does not exist in bucket');
                done();
            })
                .catch(function (exception) {
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            });
        });
    });
    describe('all function', function () {
        it('should get all values from configuration', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({ key: 'value', key2: 'value' })) }); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.all()
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual({ key: 'value', key2: 'value' });
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            })
                .catch(function (exception) {
                expect(exception).toBeNull();
                done();
            });
        });
        it('should get all value from an overriden configuration', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({ key: 'value' })) }); }
            });
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', { we: "don't care" }, false, mockedS3);
            // WHEN
            configurationService.all()
                .then(function (values) {
                // THEN
                expect(values).not.toBeNull();
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                expect(mockedS3.upload).toHaveBeenCalledTimes(1);
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'config.json',
                    Body: JSON.stringify({ we: "don't care" }, null, 2)
                });
                done();
            })
                .catch(function (exception) {
                expect(exception).toBeNull();
                done();
            });
        });
        it('should load remote file just one time when requesting configuration', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.resolve({ Body: new Buffer(JSON.stringify({ key: 'value' })) }); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.all()
                .then(function () { return configurationService.all(); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            })
                .catch(function (exception) {
                expect(exception).toBeNull();
                done();
            });
        });
        it('should throw an error if file does not exist in bucket', function (done) {
            // GIVEN
            var mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: function () { return Promise.reject({}); }
            });
            var configurationService = new s3_configuration_service_1.S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);
            // WHEN
            configurationService.all()
                .then(function () { return configurationService.all(); })
                .then(function (value) {
                // THEN
                fail('we should never reach here because config file does not exist in bucket');
                done();
            })
                .catch(function (exception) {
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            });
        });
    });
});
//# sourceMappingURL=s3-configuration.service.spec.js.map