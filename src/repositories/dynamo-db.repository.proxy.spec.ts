import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {DynamoDbTableCaracteristicsModel} from '../models/dynamo-db-table-caracteristics.model';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {DynamoDbRepositoryImplementation} from './dynamo-db.repository.implementation';
import {DynamoDbRepositoryProxy} from './dynamo-db.repository.proxy';

describe('DynamoDbRepositoryProxy', () => {

    describe('findAll function', () => {

        it('should return transformed information from aws sdk after calling creation', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            // WHEN
            dynamoDbRepositoryProxy.findAll()
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(result).toEqual([{myProperty: 'myValue'}]);
                    expect(mockedDynamoDb.createTable).toHaveBeenCalled();
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('findById function', () => {

        it('should return transformed information from aws sdk after calling creation', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'get').and.returnValue({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            // WHEN
            dynamoDbRepositoryProxy.findById('3')
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(result).toEqual({myProperty: 'myValue'});
                    expect(mockedDynamoDb.createTable).toHaveBeenCalled();
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('findBy function', () => {

        it('should return transformed information from aws sdk after calling creation', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            // WHEN
            dynamoDbRepositoryProxy.findBy('field', 'value')
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(result).toEqual([{myProperty: 'myValue'}]);
                    expect(mockedDynamoDb.createTable).toHaveBeenCalled();
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('save function', () => {

        it('should call put function from aws sdk after calling creation', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'put').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            // WHEN
            dynamoDbRepositoryProxy.save({myField: 'myValue'})
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(mockedDynamoDb.createTable).toHaveBeenCalled();
                    expect(mockedDocumentClient.put).toHaveBeenCalledWith({
                        TableName: 'toto',
                        Item: {
                            myField: 'myValue'
                        }
                    });
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('deleteById function', () => {

        it('should call delete function from aws sdk after calling creation', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'delete').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            // WHEN
            dynamoDbRepositoryProxy.deleteById('2')
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(mockedDynamoDb.createTable).toHaveBeenCalled();
                    expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                        TableName: 'toto',
                        Key: {
                            id: '2'
                        }
                    });
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('deleteAll function', () => {

        it('should call delete function from aws sdk for all items after calling creation', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
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
            spyOn(mockedDocumentClient, 'delete').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            const dynamoDbRepositoryProxy = new DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);

            // WHEN
            dynamoDbRepositoryProxy.deleteAll()
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(mockedDynamoDb.createTable).toHaveBeenCalled();
                    expect(mockedDocumentClient.delete).toHaveBeenCalledTimes(2);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});