import {expect, test, describe, beforeEach} from 'vitest';
import { S3Builder } from './s3.builder';

describe('S3Builder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('withBucketName function', () => {

        test('should store bucket name', () => {
            // GIVEN

            // WHEN
            const builder = new S3Builder()
                .withBucketName('test');

            // THEN
            expect(builder).not.toBeNull();
            expect(builder['bucketName']).toEqual('test');
        });
    });

    describe('createIfNotExists function', () => {

        test('should store create if not exists information', () => {
            // GIVEN

            // WHEN
            const builder = new S3Builder()
                .withBucketName('test')
                .createIfNotExists();

            // THEN
            expect(builder).not.toBeNull();
            expect(builder['bucketName']).toEqual('test');
            expect(builder['mustCreateBeforeUse']).toEqual(true);
        });
    });
    describe('asConfigurationService function', () => {

        test('should throw an error if AWS_REGION environment variable is not set', () => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                new S3Builder()
                    .withBucketName('toto')
                    .asConfigurationService();
                throw new Error('we should never reach here because asConfigurationService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
            }
        });

        test('should throw an error when a bucket name was not supplied', () => {
            // GIVEN

            // WHEN
            try {
                new S3Builder()
                    .asConfigurationService();
                throw new Error('we should never reach here because asConfigurationService should throw an error when a bucket is not supplied');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
            }
        });
    });

    describe('asHostingService function', () => {

        test('should throw an error if AWS_REGION environment variable is not set', () => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                new S3Builder()
                    .withBucketName('toto')
                    .asHostingService();
                throw new Error('we should never reach here because asHostingService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
            }
        });

        test('should throw an error when a bucket name was not supplied', () => {
            // GIVEN

            // WHEN
            try {
                new S3Builder()
                    .asHostingService();
                throw new Error('we should never reach here because asHostingService should throw an error when a bucket is not supplied');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
            }
        });
    });

    describe('asStorageService function', () => {

        test('should throw an error if AWS_REGION environment variable is not set', () => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                new S3Builder()
                    .withBucketName('toto')
                    .asStorageService();
                throw new Error('we should never reach here because asStorageService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
            }
        });

        test('should throw an error when a bucket name was not supplied', () => {
            // GIVEN

            // WHEN
            try {
                new S3Builder()
                    .asStorageService();
                throw new Error('we should never reach here because asStorageService should throw an error when a bucket is not supplied');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
            }
        });
    });
});
