import { SnsBuilder } from './sns.builder';
import { DynamoDbBuilder } from '../dynamodb/dynamo-db.builder';

describe('SNSBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        it('should throw an error if AWS region is not defined', done => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                const sns = new SnsBuilder()
                    .withTopicName('topic')
                    .build();
                fail('Web should never reach here because build function should throw an error when AWS_REGION env variable is not set');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }

        });

        it('should throw an error on build when topic name is not set', done => {
            // GIVEN

            // WHEN
            try {
                const sns = new SnsBuilder().build();
                fail('we should never reach here because an exception should have happened');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual(new Error('Topic name is mandatory'));
                done();
            }
        });

        it('should not throw an error on build when topic name is set', done => {
            // GIVEN

            // WHEN
            try {
                const sns = new SnsBuilder()
                    .withTopicName('topic')
                    .build();
                expect(sns).not.toBeNull();
                done();
            } catch (exception) {
                // THEN
                fail(exception);
                done();
            }
        });

        it('should build a proxy when creation if not exists is asked', done => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('topic')
                .createIfNotExists()
                .build();

            // THEN
            expect(sns).not.toBeNull();
            expect(sns.constructor.name).toEqual('SnsProxy');
            done();
        });

        it('should build a default implementation when creation if not exists is not asked', done => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('topic')
                .build();

            // THEN
            expect(sns).not.toBeNull();
            expect(sns.constructor.name).toEqual('SnsImplementation');
            done();
        });
    });

    describe('withTopicName function', () => {

        it('should store topic name when called', done => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('test')
                .build();

            // THEN
            expect(sns['topicName']).not.toBeNull();
            expect(sns['topicName']).toEqual('test');
            done();
        });
    });
});
