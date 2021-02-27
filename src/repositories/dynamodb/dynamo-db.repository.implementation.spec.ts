import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';
import { DynamoDbTableCaracteristicsModel, GENERATED_SORT_KEY } from '../../models/dynamo-db-table-caracteristics.model';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

jest.mock('uuid');

describe('DynamoDbRepositoryImplementation', () => {

    describe('findOneByPartitionKey function', () => {

        it('should return transformed information from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const getMock = jest.fn((params: DynamoDB.Types.GetItemInput) => ({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            }));
            const mockedDocumentClient = {
                get: getMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.findOneByPartitionKey('2');
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

    describe('findOneByPartitionKeyAndSortKey function', () => {

        it('should return transformed information from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id',
                sortKeyName: 'sort'
            };
            const getMock = jest.fn((params: DynamoDB.Types.GetItemInput) => ({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            }));
            const mockedDocumentClient = {
                get: getMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.findOneByPartitionKeyAndSortKey('2', '4');
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

    describe('findAllByPartitionKey function', () => {

        it('should return transformed information from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const queryMock = jest.fn((params: DynamoDB.Types.QueryInput) => ({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            }));
            const mockedDocumentClient = {
                query: queryMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const results = await dynamoDbRepositoryImplementation.findAllByPartitionKey('myProperty');
                // THEN
                expect(results).not.toBeNull();
                expect(results).toEqual([{myProperty: 'myValue'}]);
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
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const putMock = jest.fn((params: DynamoDB.Types.PutItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                put: putMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.save({myField: 'myValue'});
                // THEN
                expect(result).not.toBeNull();
                expect(putMock).toHaveBeenCalledWith({
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

        it('should call put function from aws sdk with generated sort key', async (done) => {
            // GIVEN
            uuid.mockImplementation(() => 'testid');
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id',
                sortKeyName: GENERATED_SORT_KEY
            };
            const putMock = jest.fn((params: DynamoDB.Types.PutItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                put: putMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.save({myField: 'myValue'});
                // THEN
                expect(result).not.toBeNull();
                expect(putMock).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Item: {
                        // @ts-ignore
                        myField: 'myValue',
                        generatedSortKey: 'testid'
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

        it('should call batchWrite function from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const batchWriteMock = jest.fn((params: DynamoDB.Types.BatchWriteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                batchWrite: batchWriteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.saveAll([{myField: 'myValue'}, {myField: 'myValue2'}], 1);
                // THEN
                expect(result).not.toBeNull();
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
                expect(batchWriteMock).toHaveBeenCalledWith({
                    RequestItems: {
                        'toto': [
                            {
                                PutRequest: {
                                    Item: {
                                        // @ts-ignore
                                        myField: 'myValue2'
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

        it('should call batchWrite function from aws sdk with generated sort key', async (done) => {
            // GIVEN
            uuid.mockImplementation(() => 'testid');
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id',
                sortKeyName: GENERATED_SORT_KEY
            };
            const batchWriteMock = jest.fn((params: DynamoDB.Types.BatchWriteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                batchWrite: batchWriteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.saveAll([{myField: 'myValue'}, {myField: 'myValue2'}], 1);
                // THEN
                expect(result).not.toBeNull();
                expect(batchWriteMock).toHaveBeenCalledWith({
                    RequestItems: {
                        'toto': [
                            {
                                PutRequest: {
                                    Item: {
                                        // @ts-ignore
                                        myField: 'myValue',
                                        generatedSortKey: 'testid'
                                    }
                                }
                            }
                        ]
                    }
                });
                expect(batchWriteMock).toHaveBeenCalledWith({
                    RequestItems: {
                        'toto': [
                            {
                                PutRequest: {
                                    Item: {
                                        // @ts-ignore
                                        myField: 'myValue2',
                                        generatedSortKey: 'testid'
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

        it('should call delete function from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id'
            };
            const deleteMock = jest.fn((params: DynamoDB.Types.DeleteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                delete: deleteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.deleteByPartitionKey('2');
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        // @ts-ignore
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

    describe('deleteByPartitionKeyAndSortKey function', () => {

        it('should call delete function from aws sdk', async (done) => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                partitionKeyName: 'id',
                sortKeyName: 'sort'
            };
            const deleteMock = jest.fn((params: DynamoDB.Types.DeleteItemInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedDocumentClient = {
                delete: deleteMock
            };
            // @ts-ignore
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            try {
                // WHEN
                const result = await dynamoDbRepositoryImplementation.deleteByPartitionKeyAndSortKey('2', '4');
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        // @ts-ignore
                        id: '2',
                        // @ts-ignore
                        sort: '4'
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
