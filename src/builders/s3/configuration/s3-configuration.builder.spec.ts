import {expect, test, describe, beforeEach} from 'vitest';
import { S3Builder } from '../s3.builder';

describe('S3ConfigurationBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        test('should build a configuration service', () => {
            // GIVEN

            // WHEN
            const configurationService = new S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .build();

            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService.constructor.name).toEqual('S3ConfigurationService');
        });
    });

    describe('withSourceFileName function', () => {

        test('should store source file name', () => {
            // GIVEN

            // WHEN
            const configurationService = new S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .withSourceFileName('myConfig.json')
                .build();

            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService['fileName']).toEqual('myConfig.json');
        });
    });

    describe('withContents function', () => {

        test('should store contents of configuration ', () => {
            // GIVEN

            // WHEN
            const configurationService = new S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .withContents({myKey: 'myValue'})
                .build();

            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService['contents']).toEqual({myKey: 'myValue'});
        });
    });

    describe('withFileContents function', () => {

        test('should store contents of configuration', () => {
            // GIVEN

            // WHEN
            const configurationService = new S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .withFileContents(__dirname + '/../../../../spec/data/config.json')
                .build();

            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService['contents']).toEqual({test: 'sample', test2: false});
        });

        test('should throw an error if file does not exist', () => {
            // GIVEN

            // WHEN
            try {
                const configurationService = new S3Builder()
                    .withBucketName('toto')
                    .asConfigurationService()
                    .withFileContents('config.json')
                    .build();
                throw new Error('we should not reach here because file does not exist');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('File config.json does not exist');
            }
        });
    });
});
