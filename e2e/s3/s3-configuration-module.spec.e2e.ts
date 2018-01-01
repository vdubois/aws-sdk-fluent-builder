import { S3Builder } from '../../src/builders/s3/s3.builder';
import S3 = require('aws-sdk/clients/s3');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const bucketName = 's3-configuration-module-e2e';

describe('S3 Configuration module', () => {

    let originalTimeout;

    /**
     * Sets timeout to 30s.
     */
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    describe('createIfNotExists function', () => {

        it('should create the bucket if it does not exist', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'value'})
                .build();
            deleteBucketIfExists()
                // WHEN
                .then(() => configurationService.get('test'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    return listBuckets();
                })
                .then(buckets => {
                    expect(buckets).not.toBeNull();
                    expect(buckets).toContain(bucketName);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not throw an error if the bucket already exist', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'value'})
                .build();
            createBucketIfNotExists()
                // WHEN
                .then(() => configurationService.get('test'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    return listBuckets();
                })
                .then(buckets => {
                    expect(buckets).not.toBeNull();
                    expect(buckets).toContain(bucketName);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('get function', () => {

        it('should throw an error if the bucket does not contain the config file', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                // WHEN
                .then(() => configurationService.get('test'))
                .then(() => {
                    fail('we should never reach here because config file is missing from bucket');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('config.json file does not exist in bucket');
                    done();
                });
        });

        it('should throw an error if the bucket contains a config file that does not contain config value', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(() => uploadEmptyConfigFile())
                // WHEN
                .then(() => configurationService.get('test'))
                .then(() => {
                    fail('we should never reach here because config file is empty');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual(`No key 'test' present in configuration`);
                    done();
                });
        });

        it('should get a config value if config file is present and contains the config value', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.get('test'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get an overriden config value if configuration was overriden with an object', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'overriden value'})
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.get('test'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('overriden value');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get an overriden config value if configuration was overriden with a file', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.get('test'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('sample');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('all function', () => {

        it('should throw an error if the bucket does not contain the config file', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
            // WHEN
                .then(() => configurationService.all())
                .then(() => {
                    fail('we should never reach here because config file is missing from bucket');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('config.json file does not exist in bucket');
                    done();
                });
        });

        it('should get all config values if config file is present and contains those config values', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.all())
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual({test: 'value', test2: 'value2'});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get overriden config values if configuration was overriden with an object', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'overriden value'})
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.all())
                .then(values => {
                    // THEN
                    expect(values).not.toBeNull();
                    expect(values).toEqual({test: 'overriden value'});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get overriden config values if configuration was overriden with a file', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.all())
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual({test: 'sample', test2: false});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});

const emptyBucket = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({Bucket: bucketName}).promise()
        .then(results =>
            Promise.all(results.Contents.map(result => s3Client.deleteObject({Bucket: bucketName, Key: result.Key}).promise())));
};

const uploadEmptyConfigFile = (): Promise<any> =>  {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({})}).promise();
};

const uploadConfigFile = (): Promise<any> =>  {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({test: 'value', test2: 'value2'})}).promise();
};

const deleteBucketIfExists = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets)
        .then(bucketNames => {
            if (bucketNames.some(bucket => bucket.Name === bucketName)) {
                return s3Client.listObjects({Bucket: bucketName}).promise()
                    .then(objects => objects.Contents)
                    .then(objects => Promise.all(
                        objects.map(s3Object => s3Client.deleteObject({
                            Bucket: bucketName,
                            Key: s3Object.Key
                        }).promise())))
                    .then(() => s3Client.deleteBucket({Bucket: bucketName}).promise())
                    .then(() => s3Client.waitFor('bucketNotExists', {Bucket: bucketName}));
            } else {
                return Promise.resolve({});
            }
        });
};

const createBucketIfNotExists = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets)
        .then(bucketNames => {
            if (bucketNames.some(bucket => bucket.Name === bucketName)) {
                return Promise.resolve({});
            } else {
                return s3Client.createBucket({Bucket: bucketName}).promise()
                    .then(() => s3Client.waitFor('bucketExists', {Bucket: bucketName}));
            }
        });
};

const listBuckets = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets.map(bucket => bucket.Name));
};
