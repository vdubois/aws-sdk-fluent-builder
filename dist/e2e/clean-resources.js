"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DynamoDB = require("aws-sdk/clients/dynamodb");
var SNS = require("aws-sdk/clients/sns");
var S3 = require("aws-sdk/clients/s3");
var cleanResources = function () {
    console.log('Cleaning resources...');
    return deleteTableIfExist()
        .then(function () { return deleteTopicIfExist(); })
        .then(function () { return deleteBucketIfExists('s3-configuration-module-e2e'); })
        .then(function () { return deleteBucketIfExists('s3-storage-module-e2e'); })
        .then(function () { return deleteBucketIfExists('s3-hosting-module-e2e'); });
};
var deleteTableIfExist = function () {
    var dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION });
    var tableName = 'dynamo-db-module-e2e';
    return dynamoDbClient.listTables({}).promise()
        .then(function (results) { return results.TableNames; })
        .then(function (tableNames) {
        if (tableNames.some(function (name) { return name === tableName; })) {
            var deleteTableParams = {
                TableName: tableName
            };
            return dynamoDbClient.deleteTable(deleteTableParams).promise()
                .then(function () { return dynamoDbClient.waitFor('tableNotExists', { TableName: tableName }).promise(); });
        }
        else {
            return Promise.resolve({});
        }
    });
};
var deleteTopicIfExist = function () {
    var snsClient = new SNS({ region: process.env.AWS_REGION });
    var topicName = 'sns-topic-e2e';
    return snsClient.listTopics({}).promise()
        .then(function (results) { return results.Topics; })
        .then(function (topics) {
        if (topics.some(function (topic) { return topic.TopicArn.indexOf(topicName) !== -1; })) {
            return snsClient.deleteTopic({
                TopicArn: topics.find(function (topic) { return topic.TopicArn.indexOf(topicName) !== -1; }).TopicArn
            }).promise();
        }
        else {
            return Promise.resolve({});
        }
    });
};
var deleteBucketIfExists = function (bucketName) {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(function (results) { return results.Buckets; })
        .then(function (bucketNames) {
        if (bucketNames.some(function (bucket) { return bucket.Name === bucketName; })) {
            return s3Client.listObjects({ Bucket: bucketName }).promise()
                .then(function (objects) { return objects.Contents; })
                .then(function (objects) { return Promise.all(objects.map(function (s3Object) { return s3Client.deleteObject({
                Bucket: bucketName,
                Key: s3Object.Key
            }).promise(); })); })
                .then(function () { return s3Client.deleteBucket({ Bucket: bucketName }).promise(); })
                .then(function () { return s3Client.waitFor('bucketNotExists', { Bucket: bucketName }); });
        }
        else {
            return Promise.resolve({});
        }
    });
};
cleanResources()
    .then(function () { return console.log('All resources clean'); });
//# sourceMappingURL=clean-resources.js.map