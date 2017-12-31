import { DeleteTableInput } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');

const cleanResources = (): Promise<any> => {
    return deleteTableIfExist();
};

const deleteTableIfExist = (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const tableName = 'dynamo-db-module-e2e';
    return dynamoDbClient.listTables({}).promise()
        .then(results => results.TableNames)
        .then(tableNames => {
            if (tableNames.some(name => name === tableName)) {
                const deleteTableParams: DeleteTableInput = {
                    TableName : tableName
                };
                return dynamoDbClient.deleteTable(deleteTableParams).promise()
                    .then(() => dynamoDbClient.waitFor('tableNotExists', {TableName: tableName}).promise());
            } else {
                return Promise.resolve({});
            }
        });
};

cleanResources()
    .then(() => console.log('All resources clean'));
