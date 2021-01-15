import {DynamoDbRepositoryImplementation} from './dynamo-db.repository.implementation';
import { DynamoDbTableCaracteristicsModel } from '../../models/dynamo-db-table-caracteristics.model';

describe('DynamoDbRepositoryImplementation', () => {

    describe('findAll function', () => {

        it('should return transformed information from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['scan']);
            mockedDocumentClient.scan.and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.findAll();
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{myProperty: 'myValue'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findById function', () => {

        it('should return transformed information from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['get']);
            mockedDocumentClient.get.and.returnValue({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.findById('2');
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual({myProperty: 'myValue'});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findBy function', () => {

        it('should return transformed information from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['scan']);
            mockedDocumentClient.scan.and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.findBy('field', 'value');
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{myProperty: 'myValue'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('save function', () => {

        it('should call put function from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['put']);
            mockedDocumentClient.put.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.save({myField: 'myValue'});
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.put).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Item: {
                        myField: 'myValue'
                    }
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteById function', () => {

        it('should call delete function from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['delete']);
            mockedDocumentClient.delete.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.deleteById('2');
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        'id': '2'
                    }
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteAll function', () => {

        it('should call delete function from aws sdk for all items', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['scan', 'delete']);
            mockedDocumentClient.scan.and.returnValue({
                promise: () => Promise.resolve({
                    Items: [
                        {
                            id: '2',
                            field: 'value'
                        },
                        {
                            id: '3',
                            field: 'other value'
                        }
                    ]})
            });
            mockedDocumentClient.delete.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.deleteAll();
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.scan).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledTimes(2);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
