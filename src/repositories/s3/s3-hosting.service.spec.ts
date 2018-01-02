import { S3HostingService } from './s3-hosting.service';
import S3 = require('aws-sdk/clients/s3');

describe('S3HostingService', () => {

    describe('uploadFilesFromDirectory function', () => {

        it('should throw an error if directory to copy does not exist', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory('/my/directory')
                .then(() => {
                    fail('we should never reach here because upload of file should have thrown errors');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).toEqual('uploadFilesFromDirectory function : directory does not exist');
                    done();
                });
        });

        it('should throw an error if given path is not a directory', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory/test.txt`)
                .then(() => {
                    fail('we should never reach here because upload of file should have thrown errors');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).toEqual(    `uploadFilesFromDirectory function : ${__dirname}/../../../spec/data/directory/test.txt`
                        + ' is not a directory');
                    done();
                });
        });

        it('should throw an error if given destination path starts with a separator', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`, '/subdir')
                .then(() => {
                    fail('we should never reach here because upload of file should have thrown errors');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).toEqual(    `uploadFilesFromDirectory function : destination path should not start with a '/'`);
                    done();
                });
        });

        it('should throw an error if given destination path does not end with a separator', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`, 'subdir/subdir2')
                .then(() => {
                    fail('we should never reach here because upload of file should have thrown errors');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).toEqual(    `uploadFilesFromDirectory function : destination path should end with a '/'`);
                    done();
                });
        });

        it('should throw an error if aws sdk returns an error', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.reject('upload error')
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`)
                .then(() => {
                    fail('we should never reach here because upload of file should have thrown errors');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('uploadFilesFromDirectory function : upload error');
                    done();
                });
        });

        it('should upload files with a call to aws sdk if there are no errors', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory(`${__dirname}/../../../spec/data/directory`)
                .then(() => {
                    // THEN
                    expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'subdirectory/test3.txt',
                        Body: new Buffer('data')
                    });
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'test.txt',
                        Body: new Buffer('data')
                    });
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'test2.txt',
                        Body: new Buffer('data')
                    });
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should upload files to a subdirectory with a call to aws sdk if there are no errors', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'upload').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const hostingService = new S3HostingService('toto', mockedS3);

            // WHEN
            hostingService.uploadFilesFromDirectory(
                `${__dirname}/../../../spec/data/directory`, 'mySubdir1/mySubdir2/')
                .then(() => {
                    // THEN
                    expect(mockedS3.upload).toHaveBeenCalledTimes(3);
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'mySubdir1/mySubdir2/subdirectory/test3.txt',
                        Body: new Buffer('data')
                    });
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'mySubdir1/mySubdir2/test.txt',
                        Body: new Buffer('data')
                    });
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'mySubdir1/mySubdir2/test2.txt',
                        Body: new Buffer('data')
                    });
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});