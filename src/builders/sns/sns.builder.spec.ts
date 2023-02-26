import {expect, test, describe, beforeEach} from 'vitest';
import {SnsBuilder} from './sns.builder';

describe('SNSBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        test('should throw an error if AWS region is not defined', () => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                const sns = new SnsBuilder()
                    .withTopicName('topic')
                    .build();
                throw new Error('Web should never reach here because build function should throw an error when AWS_REGION env variable is not set');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
            }
        });

        test('should throw an error on build when topic name is not set', () => {
            // GIVEN

            // WHEN
            try {
                const sns = new SnsBuilder().build();
                throw new Error('we should never reach here because an exception should have happened');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual(new Error('Topic name is mandatory'));
            }
        });

        test('should not throw an error on build when topic name is set', () => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('topic')
                .build();
            expect(sns).not.toBeNull();
        });

        test('should build a proxy when creation if not exists is asked', () => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('topic')
                .createIfNotExists()
                .build();

            // THEN
            expect(sns).not.toBeNull();
            expect(sns.constructor.name).toEqual('SnsProxy');
        });

        test('should build a default implementation when creation if not exists is not asked', () => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('topic')
                .build();

            // THEN
            expect(sns).not.toBeNull();
            expect(sns.constructor.name).toEqual('SnsImplementation');
        });
    });

    describe('withTopicName function', () => {

        test('should store topic name when called', () => {
            // GIVEN

            // WHEN
            const sns = new SnsBuilder()
                .withTopicName('test')
                .build();

            // THEN
            expect(sns['topicName']).not.toBeNull();
            expect(sns['topicName']).toEqual('test');
        });
    });
});
