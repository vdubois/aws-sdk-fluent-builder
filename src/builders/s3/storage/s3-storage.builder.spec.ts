import { S3Builder } from '../s3.builder';

describe('S3StorageBuilder', () => {

    describe('build function', () => {

        it('should build a storage service', done => {
            // GIVEN

            // WHEN
            const storageService = new S3Builder()
                .withBucketName('toto')
                .asStorageService()
                .build();

            // THEN
            expect(storageService).not.toBeNull();
            expect(storageService.constructor.name).toEqual('S3StorageService');
            done();
        });
    });
});
