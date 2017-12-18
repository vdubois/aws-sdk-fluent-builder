import { DynamoDbBuilder } from '../../src/builders/dynamo-db.builder';
import { DeleteTableInput, DocumentClient } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import PutItemInput = DocumentClient.PutItemInput;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let tableName = 'dynamo-db-module-e2e';

describe('DynamoDB module', () => {

    describe('findAll function', () => {

        it('should return all table objects', done => {
            // GIVEN
            emptyTable()
                .then((result) => insertItem({id: '1', value: 'test'}))
                .then((result) => insertItem({ id: '2', value: 'test 2' }))
                .then((result) => {
                    const dynamoDbRepository = new DynamoDbBuilder()
                        .withTableName(tableName)
                        .build();

                    // WHEN
                    return dynamoDbRepository.findAll()
                        .then(result => {
                            // THEN
                            expect(result).not.toBeNull();
                            expect(result).toEqual([{ id: '2', value: 'test 2' }, { id: '1', value: 'test' }]);
                            done();
                        });
                })
                .catch(exception => {
                    deleteTable().then(() => {
                        fail(exception);
                        done();
                    });
                });
        });
    });
});

const emptyTable = (): Promise<any> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    return dynamoDbClient.scan({ TableName: tableName })
        .promise()
        .then(results =>
            Promise.all(results.Items.map(item => dynamoDbClient.delete({TableName: tableName, Key: {id: item.id}}).promise())));
};

const deleteTable = (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const deleteTableParams: DeleteTableInput = {
        TableName : tableName
    };
    return dynamoDbClient.deleteTable(deleteTableParams).promise();
};

const insertItem = (item: object): Promise<any> =>  {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const putParams: PutItemInput = {
        TableName: tableName,
        Item: item
    };
    return dynamoDbClient.put(putParams).promise();
};
