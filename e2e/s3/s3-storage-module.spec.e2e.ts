import { S3Builder } from '../../src/builders/s3/s3.builder';
import S3 = require('aws-sdk/clients/s3');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const bucketName = 's3-storage-module-e2e';
const storageService = new S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asStorageService()
    .build();

describe('S3 Storage module', () => {

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
            const storageService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asStorageService()
                .build();
            deleteBucketIfExists()
                // WHEN
                .then(() => storageService.listFiles())
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual([]);
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
                .asStorageService()
                .build();
            createBucketIfNotExists()
                // WHEN
                .then(() => storageService.listFiles())
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual([]);
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

    describe('listFiles function', () => {

        it('should get an empty list if bucket is empty', done => {
            // GIVEN
            emptyBucket()
                // WHEN
                .then(() => storageService.listFiles())
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual([]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get full files list if bucket is not empty with no predicate', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.listFiles())
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual(['sample.txt', 'test.md', 'test.txt']);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get partial files list if bucket is not empty with a predicate', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.listFiles(filename => filename.endsWith('.txt')))
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual(['sample.txt', 'test.txt']);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get no files if bucket is not empty with a non matching predicate', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.listFiles(filename => filename.endsWith('.ts')))
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual([]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('readFile function', () => {

        it('should throw an error if file does not exist in bucket', done => {
            // GIVEN
            emptyBucket()
                // WHEN
                .then(() => storageService.readFile('test.txt'))
                .then(() => {
                    fail('we should never reach here because the file does not exist in bucket');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('readFile function : NoSuchKey: The specified key does not exist.');
                    done();
                });
        });

        it('should return file content if file does exist in bucket', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.readFile('test.txt'))
                .then(fileContent => {
                    // THEN
                    expect(fileContent).not.toBeNull();
                    expect(fileContent).toEqual(new Buffer('sample data'));
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('writeFile function', () => {

        it('should override a file if file already exists in bucket', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.writeFile('test.txt', new Buffer('overriden content')))
                .then(() => loadFileContent('test.txt'))
                .then(fileContent => {
                    // THEN
                    expect(fileContent).not.toBeNull();
                    expect(fileContent).toEqual('overriden content');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should write a file if file does not exist in bucket', done => {
            // GIVEN
            emptyBucket()
                // WHEN
                .then(() => storageService.writeFile('test.txt', new Buffer('written content')))
                .then(() => loadFileContent('test.txt'))
                .then(fileContent => {
                    // THEN
                    expect(fileContent).not.toBeNull();
                    expect(fileContent).toEqual('written content');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('deleteFile function', () => {

        it('should not throw an error if file does not exist in bucket', done => {
            // GIVEN
            emptyBucket()
                // WHEN
                .then(() => storageService.deleteFile('test.txt'))
                .then(() => {
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should delete file if file exists in bucket', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.deleteFile('test.txt'))
                .then(() => listFiles())
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual(['sample.txt', 'test.md']);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('copyFile function', () => {

        it('should throw an error if source file path does not exist in bucket', done => {
            // GIVEN
            emptyBucket()
                // WHEN
                .then(() => storageService.copyFile('test.txt', 'test2.txt'))
                .then(() => {
                    fail('we should never reach here because the file does not exist in bucket');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('copyFile function : NoSuchKey: The specified key does not exist.');
                    done();
                });
        });

        it('should copy file if source file exists and destination files does not exist', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.copyFile('test.txt', 'copied.txt'))
                .then(() => loadFileContent('copied.txt'))
                .then(fileContent => {
                    // THEN
                    expect(fileContent).toEqual('sample data');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should copy file if source file exists and destination file already exist', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.copyFile('test.txt', 'test.md'))
                .then(() => loadFileContent('test.md'))
                .then(fileContent => {
                    // THEN
                    expect(fileContent).toEqual('sample data');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});

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

const emptyBucket = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({Bucket: bucketName}).promise()
        .then(results =>
            Promise.all(results.Contents.map(result => s3Client.deleteObject({Bucket: bucketName, Key: result.Key}).promise())));
};

const uploadAllFiles = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({
        Bucket: bucketName,
        Key: 'test.txt',
        Body: 'sample data'
    }).promise()
        .then(() => s3Client.upload({
            Bucket: bucketName,
            Key: 'sample.txt',
            Body: 'sample data'
        }).promise())
        .then(() => s3Client.upload({
            Bucket: bucketName,
            Key: 'test.md',
            Body: 'sample data'
        }).promise());
};

const loadFileContent = (filePath: string): Promise<string> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.getObject({Bucket: bucketName, Key: filePath}).promise().then(result => result.Body.toString());
};

const listFiles = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({Bucket: bucketName}).promise()
        .then(result => result.Contents.map(file => file.Key));
};

const listBuckets = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets.map(bucket => bucket.Name));
};
