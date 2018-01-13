import { DeleteTableInput } from 'aws-sdk/clients/dynamodb';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import * as SNS from 'aws-sdk/clients/sns';
import * as S3 from 'aws-sdk/clients/s3';

const cleanResources = (): Promise<any> => {
    console.log('Cleaning resources...');
    return deleteTableIfExist()
        .then(() => deleteTopicIfExist())
        .then(() => deleteBucketIfExists('s3-configuration-module-e2e'))
        .then(() => deleteBucketIfExists('s3-storage-module-e2e'))
        .then(() => deleteBucketIfExists('s3-hosting-module-e2e'));
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

const deleteBucketIfExists = (bucketName: string) => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets)
        .then(bucketNames => {
            if (bucketNames.some(bucket => bucket.Name === bucketName)) {
                return s3Client.listObjects({Bucket: bucketName}).promise()
                    .then(objects => objects.Contents)
                    .then(objects => Promise.all(
                        objects.map(s3Object => s3Client.deleteObject({
                            Bucket: bucketName,
                            Key: s3Object.Key
                        }).promise())))
                    .then(() => s3Client.deleteBucket({Bucket: bucketName}).promise())
                    .then(() => s3Client.waitFor('bucketNotExists', {Bucket: bucketName}));
            } else {
                return Promise.resolve({});
            }
        });
};

cleanResources()
    .then(() => console.log('All resources clean'));
