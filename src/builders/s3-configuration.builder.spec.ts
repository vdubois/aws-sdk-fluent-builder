import { S3Builder } from './s3.builder';

describe('S3ConfigurationBuilder', () => {

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
});
