import { S3HostingService } from './s3-hosting.service';

describe('S3HostingService', () => {

    describe('uploadFilesFromDirectory function', () => {

        it('should throw an error if directory to copy does not exist', async (done) => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory('/my/directory');
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            } catch (exception) {
                // THEN
                expect(exception.message).toEqual('uploadFilesFromDirectory function : source directory does not exist');
                done();
            }
        });

        it('should throw an error if given path is not a directory', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory/test.txt`);
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            } catch (exception) {
                // THEN
                expect(exception.message).toEqual(`uploadFilesFromDirectory function : ${__dirname}/../../../spec/data/directory/test.txt`
                    + ' is not a directory');
                done();
            }
        });

        it('should throw an error if given destination path starts with a separator', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try { // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`, '/subdir');
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            } catch (exception) {
                // THEN
                expect(exception.message).toEqual(`uploadFilesFromDirectory function : destination path should not start with a '/'`);
                done();
            }
        });

        it('should throw an error if given destination path does not end with a separator', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`, 'subdir/subdir2');
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            } catch (exception) {
                // THEN
                expect(exception.message).toEqual(`uploadFilesFromDirectory function : destination path should end with a '/'`);
                done();
            }
        });

        it('should throw an error if aws sdk returns an error', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload', 'putBucketPolicy', 'putBucketWebsite']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.reject({message: 'upload error'})
            });
            mockedS3.putBucketPolicy.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketWebsite.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`);
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            } catch (exception) {
                console.error(exception);
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('upload error');
                done();
            }
        });

        it('should upload files with a call to aws sdk if there are no errors', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload', 'putBucketPolicy', 'putBucketWebsite']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketPolicy.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketWebsite.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`);
                // THEN
                expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: '/subdirectory/test3.txt',
                    Body: Buffer.from('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: '/test.txt',
                    Body: Buffer.from('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: '/test2.txt',
                    Body: Buffer.from('data')
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should upload files to a subdirectory with a call to aws sdk if there are no errors', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload', 'putBucketPolicy', 'putBucketWebsite']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketPolicy.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketWebsite.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(
                    `${__dirname}/../../../spec/data/directory`, 'mySubdir1/mySubdir2/');
                // THEN
                expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2//subdirectory/test3.txt',
                    Body: Buffer.from('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2//test.txt',
                    Body: Buffer.from('data')
                });
                expect(mockedS3.upload).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2//test2.txt',
                    Body: Buffer.from('data')
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should set the bucket type to website hosting', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', [
                'listBuckets', 'createBucket', 'waitFor', 'upload', 'putBucketPolicy', 'putBucketWebsite'
            ]);
            mockedS3.listBuckets.and.returnValue({
                promise: () => Promise.resolve({Buckets: []})
            });
            mockedS3.createBucket.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.waitFor.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketPolicy.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.putBucketWebsite.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', true, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(
                    `${__dirname}/../../../spec/data/directory`, 'mySubdir1/mySubdir2/');
                // THEN
                expect(mockedS3.createBucket).toHaveBeenCalledTimes(1);
                expect(mockedS3.putBucketPolicy).toHaveBeenCalledTimes(1);
                expect(mockedS3.putBucketWebsite).toHaveBeenCalledTimes(1);
                expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
