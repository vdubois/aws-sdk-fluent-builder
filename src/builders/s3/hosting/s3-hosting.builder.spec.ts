import {expect, test, describe, beforeEach} from 'vitest';
import { S3Builder } from '../s3.builder';

describe('S3HostingBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        test('should build a hosting service', () => {
            // GIVEN

            // WHEN
            const hostingService = new S3Builder()
                .withBucketName('toto')
                .asHostingService()
                .build();

            // THEN
            expect(hostingService).not.toBeNull();
            expect(hostingService.constructor.name).toEqual('S3HostingService');
        });
    });
});
