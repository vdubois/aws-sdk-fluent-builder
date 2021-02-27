import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { DeleteTableInput } from 'aws-sdk/clients/dynamodb';
import * as SNS from 'aws-sdk/clients/sns';
import * as S3 from 'aws-sdk/clients/s3';

export const deleteTableIfExist = async (tableName: string): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.listTables({}).promise();
    if (TableNames.some(name => name === tableName)) {
        const deleteTableParams: DeleteTableInput = {
            TableName : tableName
        };
        await dynamoDbClient.deleteTable(deleteTableParams).promise();
        return dynamoDbClient.waitFor('tableNotExists', {TableName: tableName}).promise();
    } else {
        return Promise.resolve({});
    }
};

export const deleteTopicIfExist = async (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    const topicName = 'sns-topic-e2e';
    const {Topics} = await snsClient.listTopics({}).promise();
    if (Topics.some(topic => topic.TopicArn.includes(topicName))) {
        return snsClient.deleteTopic({
            TopicArn: Topics.find(topic => topic.TopicArn.includes(topicName)).TopicArn
        }).promise();
    } else {
        return Promise.resolve({});
    }
};

export const deleteBucketIfExists = async (bucketName: string) => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    const {Buckets} = await s3Client.listBuckets().promise();
    if (Buckets.some(bucket => bucket.Name === bucketName)) {
        const {Contents} = await s3Client.listObjects({Bucket: bucketName}).promise();
        for (const s3Object of Contents) {
            await s3Client.deleteObject({
                Bucket: bucketName,
                Key: s3Object.Key
            }).promise();
        }
        await s3Client.deleteBucket({Bucket: bucketName}).promise();
        return s3Client.waitFor('bucketNotExists', {Bucket: bucketName});
    } else {
        return Promise.resolve({});
    }
};

