import { DeleteTableInput } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import SNS = require('aws-sdk/clients/sns');

const cleanResources = (): Promise<any> => {
    return deleteTableIfExist()
        .then(() => deleteTopicIfExist());
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

const deleteTopicIfExist = (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    const topicName = 'sns-topic-e2e';
    return snsClient.listTopics({}).promise()
        .then(results => results.Topics)
        .then(topics => {
            if (topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1)) {
                return snsClient.deleteTopic({
                    TopicArn: topics.find(topic => topic.TopicArn.indexOf(topicName) !== -1).TopicArn
                }).promise();
            } else {
                return Promise.resolve({});
            }
        });
};

cleanResources()
    .then(() => console.log('All resources clean'));
