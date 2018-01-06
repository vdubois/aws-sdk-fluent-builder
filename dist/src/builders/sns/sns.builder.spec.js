"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sns_builder_1 = require("./sns.builder");
describe('SNSBuilder', function () {
    beforeEach(function () {
        process.env.AWS_REGION = 'test';
    });
    describe('build function', function () {
        it('should throw an error if AWS region is not defined', function (done) {
            // GIVEN
            process.env = {};
            // WHEN
            try {
                var sns = new sns_builder_1.SnsBuilder()
                    .withTopicName('topic')
                    .build();
                fail('Web should never reach here because build function should throw an error when AWS_REGION env variable is not set');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });
        it('should throw an error on build when topic name is not set', function (done) {
            // GIVEN
            // WHEN
            try {
                var sns = new sns_builder_1.SnsBuilder().build();
                fail('we should never reach here because an exception should have happened');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual(new Error('Topic name is mandatory'));
                done();
            }
        });
        it('should not throw an error on build when topic name is set', function (done) {
            // GIVEN
            // WHEN
            try {
                var sns = new sns_builder_1.SnsBuilder()
                    .withTopicName('topic')
                    .build();
                expect(sns).not.toBeNull();
                done();
            }
            catch (exception) {
                // THEN
                fail(exception);
                done();
            }
        });
        it('should build a proxy when creation if not exists is asked', function (done) {
            // GIVEN
            // WHEN
            var sns = new sns_builder_1.SnsBuilder()
                .withTopicName('topic')
                .createIfNotExists()
                .build();
            // THEN
            expect(sns).not.toBeNull();
            expect(sns.constructor.name).toEqual('SnsProxy');
            done();
        });
        it('should build a default implementation when creation if not exists is not asked', function (done) {
            // GIVEN
            // WHEN
            var sns = new sns_builder_1.SnsBuilder()
                .withTopicName('topic')
                .build();
            // THEN
            expect(sns).not.toBeNull();
            expect(sns.constructor.name).toEqual('SnsImplementation');
            done();
        });
    });
    describe('withTopicName function', function () {
        it('should store topic name when called', function (done) {
            // GIVEN
            // WHEN
            var sns = new sns_builder_1.SnsBuilder()
                .withTopicName('test')
                .build();
            // THEN
            expect(sns['topicName']).not.toBeNull();
            expect(sns['topicName']).toEqual('test');
            done();
        });
    });
});
//# sourceMappingURL=sns.builder.spec.js.map