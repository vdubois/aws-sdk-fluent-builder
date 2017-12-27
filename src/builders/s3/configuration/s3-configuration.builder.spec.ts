import { S3Builder } from '../s3.builder';

describe('S3ConfigurationBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        it('should build a configuration service', done => {
            // GIVEN

            // WHEN
            const configurationService = new S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .build();

            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService.constructor.name).toEqual('S3ConfigurationService');
            done();
        });
    });

    describe('withSourceFileName function', () => {

        it('should store source file name', done => {
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
            done();
        });
    });

    describe('withContents function', () => {

        it('should store contents of configuration ', done => {
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
            done();
        });
    });

    describe('withFileContents function', () => {

        it('should store contents of configuration', done => {
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
            done();
        });

        it('should throw an error if file does not exist', done => {
            // GIVEN

            // WHEN
            try {
                const configurationService = new S3Builder()
                    .withBucketName('toto')
                    .asConfigurationService()
                    .withFileContents('config.json')
                    .build();
                fail('we should not reach here because file does not exist');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('File config.json does not exist');
                done();
            }
        });
    });
});
