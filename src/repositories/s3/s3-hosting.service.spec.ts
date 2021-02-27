import { S3HostingService } from './s3-hosting.service';
import { S3 } from 'aws-sdk';

describe('S3HostingService', () => {

    describe('uploadFilesFromDirectory function', () => {

        it('should throw an error if directory to copy does not exist', async (done) => {
            // GIVEN
            const uploadMock = jest.fn((params: S3.Types.UploadPartRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock
            };
            // @ts-ignore
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
            const uploadMock = jest.fn((params: S3.Types.UploadPartRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock
            };
            // @ts-ignore
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
            const uploadMock = jest.fn((params: S3.Types.UploadPartRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock
            };
            // @ts-ignore
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
            const uploadMock = jest.fn((params: S3.Types.UploadPartRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock
            };
            // @ts-ignore
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
            const uploadMock = jest.fn((params: S3.Types.UploadPartRequest) => ({
                promise: () => Promise.reject({message: 'upload error'})
            }));
            const putBucketPolicyMock = jest.fn((params: S3.Types.PutBucketPolicyRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketWebsiteMock = jest.fn((params: S3.Types.PutBucketWebsiteRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock,
                putBucketPolicy: putBucketPolicyMock,
                putBucketWebsite: putBucketWebsiteMock
            };

            // @ts-ignore
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`);
                fail('we should never reach here because upload of file should have thrown errors');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('upload error');
                done();
            }
        });

        it('should upload files with a call to aws sdk if there are no errors', async done => {
            // GIVEN
            const uploadMock = jest.fn((params: any) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketPolicyMock = jest.fn((params: S3.Types.PutBucketPolicyRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketWebsiteMock = jest.fn((params: S3.Types.PutBucketWebsiteRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock,
                putBucketPolicy: putBucketPolicyMock,
                putBucketWebsite: putBucketWebsiteMock
            };
            // @ts-ignore
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`);
                // THEN
                expect(uploadMock).toHaveBeenCalledTimes(3);
                expect(uploadMock).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: '/subdirectory/test3.txt',
                    Body: Buffer.from('data')
                });
                expect(uploadMock).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: '/test.txt',
                    Body: Buffer.from('data')
                });
                expect(uploadMock).toHaveBeenCalledWith({
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
            const uploadMock = jest.fn((params: any) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketPolicyMock = jest.fn((params: S3.Types.PutBucketPolicyRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketWebsiteMock = jest.fn((params: S3.Types.PutBucketWebsiteRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                upload: uploadMock,
                putBucketPolicy: putBucketPolicyMock,
                putBucketWebsite: putBucketWebsiteMock
            };
            // @ts-ignore
            const hostingService = new S3HostingService('toto', false, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(
                    `${__dirname}/../../../spec/data/directory`, 'mySubdir1/mySubdir2/');
                // THEN
                expect(uploadMock).toHaveBeenCalledTimes(3);
                expect(uploadMock).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2//subdirectory/test3.txt',
                    Body: Buffer.from('data')
                });
                expect(uploadMock).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'mySubdir1/mySubdir2//test.txt',
                    Body: Buffer.from('data')
                });
                expect(uploadMock).toHaveBeenCalledWith({
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
            const listBucketsMock = jest.fn(() => ({
                promise: () => Promise.resolve({Buckets: []})
            }));
            const createBucketMock = jest.fn((params: S3.Types.CreateBucketRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const waitForMock = jest.fn(() => ({
                promise: () => Promise.resolve({})
            }));
            const uploadMock = jest.fn((params: any) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketPolicyMock = jest.fn((params: S3.Types.PutBucketPolicyRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const putBucketWebsiteMock = jest.fn((params: S3.Types.PutBucketWebsiteRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                listBuckets: listBucketsMock,
                createBucket: createBucketMock,
                waitFor: waitForMock,
                upload: uploadMock,
                putBucketPolicy: putBucketPolicyMock,
                putBucketWebsite: putBucketWebsiteMock
            };
            // @ts-ignore
            const hostingService = new S3HostingService('toto', true, mockedS3);

            try {
                // WHEN
                await hostingService.uploadFilesFromDirectory(
                    `${__dirname}/../../../spec/data/directory`, 'mySubdir1/mySubdir2/');
                // THEN
                expect(createBucketMock).toHaveBeenCalledTimes(1);
                expect(putBucketPolicyMock).toHaveBeenCalledTimes(1);
                expect(putBucketWebsiteMock).toHaveBeenCalledTimes(1);
                expect(uploadMock).toHaveBeenCalledTimes(3);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
