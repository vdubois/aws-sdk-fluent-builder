import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDbTableCaracteristicsModel } from '../../models/dynamo-db-table-caracteristics.model';
import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';
import { DynamoDbRepositoryProxy } from './dynamo-db.repository.proxy';

describe('DynamoDbRepositoryProxy', () => {

    describe('findAll function', () => {

        it('should return transformed information from aws sdk after calling creation and table does not exist', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['listTables', 'createTable', 'waitFor']);
            mockedDynamoDb.listTables.and.returnValues({
                promise: () => Promise.resolve({TableNames: []})
            }, {
                promise: () => Promise.resolve({TableNames: ['toto']})
            });
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedDynamoDb.waitFor.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['scan']);
            mockedDocumentClient.scan.and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.findAll();
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{myProperty: 'myValue'}]);
                expect(mockedDynamoDb.listTables).toHaveBeenCalledTimes(1);
                expect(mockedDynamoDb.createTable).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.scan).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.scan).toHaveBeenCalledWith({TableName: 'toto', ConsistentRead: true});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should return transformed information from aws sdk after calling creation and table does exist', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['listTables', 'createTable', 'waitFor']);
            mockedDynamoDb.listTables.and.returnValue({
                promise: () => Promise.resolve({TableNames: ['toto']})
            });
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedDynamoDb.waitFor.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['scan']);
            mockedDocumentClient.scan.and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.findAll();
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{myProperty: 'myValue'}]);
                expect(mockedDynamoDb.listTables).toHaveBeenCalledTimes(1);
                expect(mockedDynamoDb.createTable).toHaveBeenCalledTimes(0);
                expect(mockedDocumentClient.scan).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.scan).toHaveBeenCalledWith({TableName: 'toto', ConsistentRead: true});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findById function', () => {

        it('should return transformed information from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['createTable']);
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['get']);
            mockedDocumentClient.get.and.returnValue({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try { // WHEN
                const result = await dynamoDbRepositoryProxy.findById('3');
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual({myProperty: 'myValue'});
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findBy function', () => {

        it('should return transformed information from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['createTable']);
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['scan']);
            mockedDocumentClient.scan.and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.findBy('field', 'value');
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{myProperty: 'myValue'}]);
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('save function', () => {

        it('should call put function from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['createTable', 'put']);
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['put']);
            mockedDocumentClient.put.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.save({myField: 'myValue'});
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
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

        it('should call delete function from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['createTable']);
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = jasmine.createSpyObj('DocumentClient', ['delete']);
            mockedDocumentClient.delete.and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.deleteById('2');
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        id: '2'
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

        it('should call delete function from aws sdk for all items after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDynamoDb = jasmine.createSpyObj('DynamoDB', ['createTable']);
            mockedDynamoDb.createTable.and.returnValue({
                promise: () => Promise.resolve({})
            });
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
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.deleteAll();
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledTimes(2);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
