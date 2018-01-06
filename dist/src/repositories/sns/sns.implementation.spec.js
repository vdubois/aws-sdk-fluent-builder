"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sns_implementation_1 = require("./sns.implementation");
var SNS = require("aws-sdk/clients/sns");
describe('SnsImplementation', function () {
    describe('publishMessage function', function () {
        it('should call publish function from aws sdk', function (done) {
            // GIVEN
            var mockedSns = new SNS();
            spyOn(mockedSns, 'listTopics').and.returnValue({
                promise: function () { return Promise.resolve({ Topics: [{ TopicArn: 'test-arn' }] }); }
            });
            spyOn(mockedSns, 'createTopic').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedSns, 'publish').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            // WHEN
            var sns = new sns_implementation_1.SnsImplementation('test', mockedSns);
            sns.publishMessage({ test2: 'value2' })
                .then(function () {
                // THEN
                expect(mockedSns.listTopics).toHaveBeenCalledTimes(1);
                expect(mockedSns.createTopic).toHaveBeenCalledTimes(0);
                expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                expect(mockedSns.publish).toHaveBeenCalledWith({
                    TopicArn: 'test-arn',
                    Message: JSON.stringify({ test2: 'value2' })
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
//# sourceMappingURL=sns.implementation.spec.js.map