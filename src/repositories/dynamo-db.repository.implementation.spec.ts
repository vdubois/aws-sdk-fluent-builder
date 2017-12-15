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
});
