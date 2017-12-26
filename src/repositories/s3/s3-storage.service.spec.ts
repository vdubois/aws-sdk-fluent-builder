import S3 = require('aws-sdk/clients/s3');
import { ListObjectsOutput } from 'aws-sdk/clients/s3';
import { S3StorageService } from './s3-storage.service';

describe('S3StorageService', () => {

    describe('listFiles function', () => {

        it('should get an empty list if aws sdk return no files', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: () => Promise.resolve({Contents: []})
            });
            const storageService = new S3StorageService('toto', mockedS3);

            // WHEN
            storageService.listFiles()
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

        it('should get one file if aws sdk returns one file', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: () => Promise.resolve({Contents: [{Key: 'test.file'}]} as ListObjectsOutput)
            });
            const storageService = new S3StorageService('toto', mockedS3);

            // WHEN
            storageService.listFiles()
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files.length).toEqual(1);
                    expect(files[0]).toEqual('test.file');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get one file if aws sdk returns multiple files but we provide a predicate', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: () => Promise.resolve({Contents: [{Key: 'test.file'}, {Key: 'test2.txt'}]} as ListObjectsOutput)
            });
            const storageService = new S3StorageService('toto', mockedS3);

            // WHEN
            storageService.listFiles(file => file.endsWith('.txt'))
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files.length).toEqual(1);
                    expect(files[0]).toEqual('test2.txt');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should throw an error if aws sdk throws an error', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: () => Promise.reject('Error when listing files')
            });
            const storageService = new S3StorageService('toto', mockedS3);

            // WHEN
            storageService.listFiles()
                .then(files => {
                    fail('we should not reach here because an error must have been thrown by aws sdk');
                    done();
                })
                .catch(exception => {
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('listFiles function : Error when listing files');
                    done();
                });

            // THEN

        });
    });

    describe('readFile function', () => {

        xit('should load file contents when', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'listObjects').and.returnValue({
                promise: () => Promise.resolve({Contents: [{Key: 'test.file'}, {Key: 'test2.txt'}]} as ListObjectsOutput)
            });

            // WHEN
            // sto
            // THEN

        });
    });
});
