"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sns_proxy_1 = require("./sns.proxy");
var sns_implementation_1 = require("./sns.implementation");
var SNS = require("aws-sdk/clients/sns");
describe('SnsProxy', function () {
    describe('publishMessage function', function () {
        it('should call publish function from aws sdk after calling topic creation and topic does not exist', function (done) {
            // GIVEN
            var mockedSns = new SNS();
            spyOn(mockedSns, 'listTopics').and.returnValues({
                promise: function () { return Promise.resolve({ Topics: [{ TopicArn: 'arn' }] }); }
            }, {
                promise: function () { return Promise.resolve({ Topics: [{ TopicArn: 'arn' }, { TopicArn: 'test' }] }); }
            });
            spyOn(mockedSns, 'createTopic').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedSns, 'publish').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            // WHEN
            var sns = new sns_proxy_1.SnsProxy(new sns_implementation_1.SnsImplementation('test', mockedSns), mockedSns);
            sns.publishMessage({ test: 'value' })
                .then(function () {
                // THEN
                expect(mockedSns.listTopics).toHaveBeenCalledTimes(2);
                expect(mockedSns.createTopic).toHaveBeenCalledTimes(1);
                expect(mockedSns.createTopic).toHaveBeenCalledWith({ Name: 'test' });
                expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                expect(mockedSns.publish).toHaveBeenCalledWith({
                    TopicArn: 'test',
                    Message: JSON.stringify({ test: 'value' })
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should call publish function from aws sdk after calling topic creation and topic does exist', function (done) {
            // GIVEN
            var mockedSns = new SNS();
            spyOn(mockedSns, 'listTopics').and.returnValue({
                promise: function () { return Promise.resolve({ Topics: [{ TopicArn: 'test' }] }); }
            });
            spyOn(mockedSns, 'createTopic').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedSns, 'publish').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            // WHEN
            var sns = new sns_proxy_1.SnsProxy(new sns_implementation_1.SnsImplementation('test', mockedSns), mockedSns);
            sns.publishMessage({ test: 'value' })
                .then(function () {
                // THEN
                expect(mockedSns.listTopics).toHaveBeenCalledTimes(2);
                expect(mockedSns.createTopic).toHaveBeenCalledTimes(0);
                expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                expect(mockedSns.publish).toHaveBeenCalledWith({
                    TopicArn: 'test',
                    Message: JSON.stringify({ test: 'value' })
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
//# sourceMappingURL=sns.proxy.spec.js.map