import { ListObjectsOutput } from 'aws-sdk/clients/s3';
import { S3StorageService } from './s3-storage.service';

describe('S3StorageService', () => {

    describe('listFiles function', () => {

        it('should get an empty list if aws sdk return no files', async (done) => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['listObjects']);
            mockedS3.listObjects.and.returnValue({
                promise: () => Promise.resolve({Contents: []})
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            // WHEN
            try {
                const files = await storageService.listFiles();

                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual([]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get one file if aws sdk returns one file', async (done) => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['listObjects']);
            mockedS3.listObjects.and.returnValue({
                promise: () => Promise.resolve({Contents: [{Key: 'test.file'}]} as ListObjectsOutput)
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            // WHEN
            try {
                const files = await storageService.listFiles();
                // THEN
                expect(files).not.toBeNull();
                expect(files.length).toEqual(1);
                expect(files[0]).toEqual('test.file');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get one file if aws sdk returns multiple files but we provide a predicate', async (done) => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['listObjects']);
            mockedS3.listObjects.and.returnValue({
                promise: () => Promise.resolve({Contents: [{Key: 'test.file'}, {Key: 'test2.txt'}]} as ListObjectsOutput)
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            // WHEN
            try {
                const files = await storageService.listFiles(file => file.endsWith('.txt'));
                // THEN
                expect(files).not.toBeNull();
                expect(files.length).toEqual(1);
                expect(files[0]).toEqual('test2.txt');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should throw an error if aws sdk throws an error', async (done) => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['listObjects']);
            mockedS3.listObjects.and.returnValue({
                promise: () => Promise.reject('Error when listing files')
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            // WHEN
            try {
                const files = await storageService.listFiles();
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('listFiles function : Error when listing files');
                done();
            }
        });
    });

    describe('readFile function', () => {

        it('should load file contents when load file from aws sdk works fine', async(done) => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: 'content'})
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                const content = await storageService.readFile('test.txt');
                // THEN
                expect(content).not.toBeNull();
                expect(content).toEqual('content');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should throw an error when load file from aws sdk thrown an error', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.reject('read error')
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                const content = await storageService.readFile('test.txt');
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('readFile function : read error');
                done();
            }
        });
    });

    describe('writeFile function', () => {

        it('should write file contents when upload from aws sdk works fine', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try { // WHEN
                const result = await storageService.writeFile('test.txt', Buffer.from('content'));
                // THEN
                expect(result).not.toBeNull();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should throw an error if aws sdk throws an error', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['upload']);
            mockedS3.upload.and.returnValue({
                promise: () => Promise.reject('write error')
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try { // WHEN
                await storageService.writeFile('path.txt', Buffer.from('content'));
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('writeFile function : write error');
                done();
            }
        });
    });

    describe('deleteFile function', () => {

        it('should throw an error if aws sdk throws an error', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['deleteObject']);
            mockedS3.deleteObject.and.returnValue({
                promise: () => Promise.reject('delete error')
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                await storageService.deleteFile('test.txt');
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('deleteFile function : delete error');
                done();
            }
        });

        it('should delete file with a call to aws sdk', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['deleteObject']);
            mockedS3.deleteObject.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                await storageService.deleteFile('test.txt');
                // THEN
                expect(mockedS3.deleteObject).toHaveBeenCalledTimes(1);
                expect(mockedS3.deleteObject).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'test.txt'
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('copyFile function', () => {

        it('should throw an error if aws sdk throws an error', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['copyObject']);
            mockedS3.copyObject.and.returnValue({
                promise: () => Promise.reject('copy error')
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                await storageService.copyFile('test.txt', 'test2.txt');
                fail('we should not reach here because an error must have been thrown by aws sdk');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('copyFile function : copy error');
                done();
            }
        });

        it('should throw an error if source and destination have same paths', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['copyObject']);
            mockedS3.copyObject.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                await storageService.copyFile('test.txt', 'test.txt');
                fail('we should not reach here because an error must have been thrown');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual('copyFile function : source and destination must have different paths');
                done();
            }
        });

        it('should copy file with a call to aws sdk', async done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['copyObject']);
            mockedS3.copyObject.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const storageService = new S3StorageService('toto', false, mockedS3);

            try {
                // WHEN
                await storageService.copyFile('test.txt', 'test2.txt');
                // THEN
                expect(mockedS3.copyObject).toHaveBeenCalledTimes(1);
                expect(mockedS3.copyObject).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    CopySource: 'toto/test.txt',
                    Key: 'test2.txt'
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
