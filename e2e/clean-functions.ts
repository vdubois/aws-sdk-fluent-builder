import {
    DeleteTableCommand,
    DeleteTableCommandInput,
    DynamoDBClient,
    ListTablesCommand,
    waitUntilTableNotExists
} from '@aws-sdk/client-dynamodb';
import {DeleteTopicCommand, ListTopicsCommand, SNSClient} from '@aws-sdk/client-sns';
import {
    DeleteBucketCommand,
    DeleteObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    S3Client,
    waitUntilBucketNotExists
} from '@aws-sdk/client-s3';

export const deleteTableIfExist = async (tableName: string): Promise<any> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.send(new ListTablesCommand({}));
    if (TableNames.some(name => name === tableName)) {
        const deleteTableParams: DeleteTableCommandInput = {
            TableName : tableName
        };
        await dynamoDbClient.send(new DeleteTableCommand(deleteTableParams));
        return waitUntilTableNotExists({
            client: dynamoDbClient,
            maxWaitTime: 200
        }, {TableName: tableName});
    } else {
        return Promise.resolve({});
    }
};

export const deleteTopicIfExist = async (): Promise<any> => {
    const snsClient = new SNSClient({region: process.env.AWS_REGION});
    const topicName = 'sns-topic-e2e';
    const {Topics} = await snsClient.send(new ListTopicsCommand({}));
    if (Topics.some(topic => topic.TopicArn.includes(topicName))) {
        return snsClient.send(new DeleteTopicCommand({
            TopicArn: Topics.find(topic => topic.TopicArn.includes(topicName)).TopicArn
        }));
    } else {
        return Promise.resolve({});
    }
};

export const deleteBucketIfExists = async (bucketName: string) => {
    const s3Client = new S3Client({ region: process.env.AWS_REGION });
    const {Buckets} = await s3Client.send(new ListBucketsCommand({}));
    if (Buckets.some(bucket => bucket.Name === bucketName)) {
        const bucketContent = await s3Client.send(new ListObjectsV2Command({Bucket: bucketName}));
        if (bucketContent.Contents) {
            for (const s3Object of bucketContent.Contents) {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: s3Object.Key
                }));
            }
        }
        await s3Client.send(new DeleteBucketCommand({Bucket: bucketName}));
        await waitUntilBucketNotExists({
            client: s3Client,
            maxWaitTime: 200
        }, {Bucket: bucketName});
        return Promise.resolve({});
    } else {
        return Promise.resolve({});
    }
};

