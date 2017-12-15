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
});