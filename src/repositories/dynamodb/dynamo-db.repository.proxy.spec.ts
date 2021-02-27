import { DynamoDbTableCaracteristicsModel } from '../../models/dynamo-db-table-caracteristics.model';
import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';
import { DynamoDbRepositoryProxy } from './dynamo-db.repository.proxy';
import { DynamoDB } from 'aws-sdk';

describe('DynamoDbRepositoryProxy', () => {

    describe('findOneByPartitionKey function', () => {

        it('should return transformed information from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                createTable: createTableMock
            };
            const getMock = jest.fn((params: DynamoDB.Types.GetItemInput) => ({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            }));
            const mockedDocumentClient = {
                get: getMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try { // WHEN
                const result = await dynamoDbRepositoryProxy.findOneByPartitionKey('3');
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

    describe('findOneByPartitionKeyAndSortKey function', () => {

        it('should return transformed information from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id',
                sortKeyName: 'sort'
            };
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                createTable: createTableMock
            };
            const getMock = jest.fn((params: DynamoDB.Types.GetItemInput) => ({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            }));
            const mockedDocumentClient = {
                get: getMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try { // WHEN
                const result = await dynamoDbRepositoryProxy.findOneByPartitionKeyAndSortKey('3', '4');
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

    describe('findAllByPartitionKey function', () => {

        it('should return transformed information from aws sdk after calling creation and table does not exist', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const listTablesMock = jest.fn((params: DynamoDB.Types.ListTablesInput) => ({
                promise: () => Promise.resolve({TableNames: []})
            }));
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const waitForMock = jest.fn(() => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                listTables: listTablesMock,
                createTable: createTableMock,
                waitFor: waitForMock,
            };
            const queryMock = jest.fn((params: DynamoDB.Types.QueryInput) => ({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            }));
            const mockedDocumentClient = {
                query: queryMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            try {
                // WHEN
                const results = await dynamoDbRepositoryProxy.findAllByPartitionKey('myProperty');
                // THEN
                expect(results).not.toBeNull();
                // @ts-ignore
                expect(results).toHaveLength(1);
                expect(results).toEqual([{myProperty: 'myValue'}]);
                expect(mockedDynamoDb.listTables).toHaveBeenCalledTimes(1);
                expect(mockedDynamoDb.createTable).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.query).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.query).toHaveBeenCalledWith({
                    TableName: 'toto',
                    KeyConditionExpression: 'id = :pk',
                    ExpressionAttributeValues: {
                        // @ts-ignore
                        ':pk': 'myProperty'
                    }
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should return transformed information from aws sdk after calling creation and table does exist', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const listTablesMock = jest.fn((params: DynamoDB.Types.ListTablesInput) => ({
                promise: () => Promise.resolve({TableNames: ['toto']})
            }));
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const waitForMock = jest.fn(() => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                listTables: listTablesMock,
                createTable: createTableMock,
                waitFor: waitForMock,
            };
            const queryMock = jest.fn((params: DynamoDB.Types.QueryInput) => ({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            }));
            const mockedDocumentClient = {
                query: queryMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            try {
                // WHEN
                const results = await dynamoDbRepositoryProxy.findAllByPartitionKey('myProperty');
                // THEN
                expect(results).not.toBeNull();
                // @ts-ignore
                expect(results).toHaveLength(1);
                expect(results).toEqual([{myProperty: 'myValue'}]);
                expect(listTablesMock).toHaveBeenCalledTimes(1);
                expect(createTableMock).toHaveBeenCalledTimes(0);
                expect(queryMock).toHaveBeenCalledTimes(1);
                expect(queryMock).toHaveBeenCalledWith({
                    TableName: 'toto',
                    KeyConditionExpression: 'id = :pk',
                    ExpressionAttributeValues: {
                        // @ts-ignore
                        ':pk': 'myProperty'
                    }
                });
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
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                createTable: createTableMock
            };
            const putMock = jest.fn((params: DynamoDB.Types.PutItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                put: putMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
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
                        // @ts-ignore
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

    describe('saveAll function', () => {

        it('should call batchWrite function from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                createTable: createTableMock
            };
            const batchWriteMock = jest.fn((params: DynamoDB.Types.BatchWriteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                batchWrite: batchWriteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.saveAll([{myField: 'myValue'}]);
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(batchWriteMock).toHaveBeenCalledWith({
                    RequestItems: {
                        'toto': [
                            {
                                PutRequest: {
                                    Item: {
                                        // @ts-ignore
                                        myField: 'myValue'
                                    }
                                }
                            }
                        ]
                    }
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteByPartitionKey function', () => {

        it('should call delete function from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                createTable: createTableMock
            };
            const deleteMock = jest.fn((params: DynamoDB.Types.DeleteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                delete: deleteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.deleteByPartitionKey('2');
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        // @ts-ignore
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

    describe('deleteByPartitionKeyAndSortKey function', () => {

        it('should call delete function from aws sdk after calling creation', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id',
                sortKeyName: 'sort'
            };
            const createTableMock = jest.fn((params: DynamoDB.Types.CreateTableInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDynamoDb = {
                createTable: createTableMock
            };
            const deleteMock = jest.fn((params: DynamoDB.Types.DeleteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                delete: deleteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // @ts-ignore
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());

            try {
                // WHEN
                const result = await dynamoDbRepositoryProxy.deleteByPartitionKeyAndSortKey('2', '4');
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        // @ts-ignore
                        id: '2',
                        // @ts-ignore
                        sort: '4',
                    }
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

});
