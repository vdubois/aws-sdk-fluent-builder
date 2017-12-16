import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {DynamoDbTableCaracteristicsModel} from '../models/dynamo-db-table-caracteristics.model';
import {DynamoDbRepositoryImplementation} from './dynamo-db.repository.implementation';

describe('DynamoDbRepositoryImplementation', () => {

    describe('findAll function', () => {

        it('should return transformed information from aws sdk', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: () => Promise.resolve({Items:[{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            // WHEN
            dynamoDbRepositoryImplementation.findAll()
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(result).toEqual([{myProperty: 'myValue'}]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('findById function', () => {

        it('should return transformed information from aws sdk', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'get').and.returnValue({
                promise: () => Promise.resolve({Item: {myProperty: 'myValue'}})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            // WHEN
            dynamoDbRepositoryImplementation.findById('2')
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(result).toEqual({myProperty: 'myValue'});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('findBy function', () => {

        it('should return transformed information from aws sdk', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: () => Promise.resolve({Items: [{myProperty: 'myValue'}]})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            // WHEN
            dynamoDbRepositoryImplementation.findBy('field', 'value')
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(result).toEqual([{myProperty: 'myValue'}]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('save function', () => {

        it('should call put function from aws sdk', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto'
            };
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'put').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            // WHEN
            dynamoDbRepositoryImplementation.save({myField: 'myValue'})
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
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

        it('should call delete function from aws sdk', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
            const mockedDocumentClient = new DocumentClient();
            spyOn(mockedDocumentClient, 'delete').and.returnValue({
                promise: () => Promise.resolve({})
            });
            const dynamoDbRepositoryImplementation = new DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);

            // WHEN
            dynamoDbRepositoryImplementation.deleteById('2')
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                        TableName: 'toto',
                        Key: {
                            'id': '2'
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

        it('should call delete function from aws sdk for all items', done => {
            // GIVEN
            const caracteristics: DynamoDbTableCaracteristicsModel = {
                tableName: 'toto',
                keyName: 'id'
            };
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

            // WHEN
            dynamoDbRepositoryImplementation.deleteAll()
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    expect(mockedDocumentClient.scan).toHaveBeenCalled();
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
