import { S3Builder } from '../s3.builder';

describe('S3HostingBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        it('should build a hosting service', done => {
            // GIVEN

            // WHEN
            const hostingService = new S3Builder()
                .withBucketName('toto')
                .asHostingService()
                .build();

            // THEN
            expect(hostingService).not.toBeNull();
            expect(hostingService.constructor.name).toEqual('S3HostingService');
            done();
        });
    });
});
