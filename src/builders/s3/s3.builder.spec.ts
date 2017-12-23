import { S3Builder } from './s3.builder';

describe('S3Builder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('withBucketName function', () => {

        it('should store bucket name', done => {
            // GIVEN

            // WHEN
            const builder = new S3Builder()
                .withBucketName('test');

            // THEN
            expect(builder).not.toBeNull();
            expect(builder['bucketName']).toEqual('test');
            done();
        });
    });

    describe('createIfNotExists function', () => {

        it('should store create if not exists information', done => {
            // GIVEN

            // WHEN
            const builder = new S3Builder()
                .withBucketName('test')
                .createIfNotExists();

            // THEN
            expect(builder).not.toBeNull();
            expect(builder['bucketName']).toEqual('test');
            expect(builder['mustCreateBeforeUse']).toEqual(true);
            done();

        });
    });
    describe('asConfigurationService function', () => {

        it('should throw an error if AWS_REGION environment variable is not set', done => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                new S3Builder()
                    .withBucketName('toto')
                    .asConfigurationService();
                fail('we should never reach here because asConfigurationService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });

        it('should throw an error when a bucket name was not supplied', done => {
            // GIVEN

            // WHEN
            try {
                new S3Builder()
                    .asConfigurationService();
                fail('we should never reach here because asConfigurationService should throw an error when a bucket is not supplied');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
                done();
            }
        });
    });

    describe('asHostingService function', () => {

        it('should throw an error if AWS_REGION environment variable is not set', done => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                new S3Builder()
                    .withBucketName('toto')
                    .asHostingService();
                fail('we should never reach here because asHostingService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });

        it('should throw an error when a bucket name was not supplied', done => {
            // GIVEN

            // WHEN
            try {
                new S3Builder()
                    .asHostingService();
                fail('we should never reach here because asHostingService should throw an error when a bucket is not supplied');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
                done();
            }
        });
    });

    describe('asStorageService function', () => {

        it('should throw an error if AWS_REGION environment variable is not set', done => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                new S3Builder()
                    .withBucketName('toto')
                    .asStorageService();
                fail('we should never reach here because asStorageService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });

        it('should throw an error when a bucket name was not supplied', done => {
            // GIVEN

            // WHEN
            try {
                new S3Builder()
                    .asStorageService();
                fail('we should never reach here because asStorageService should throw an error when a bucket is not supplied');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
                done();
            }
        });
    });
});
