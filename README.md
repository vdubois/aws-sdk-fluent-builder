# Typescript fluent API for AWS SDK

![Build status](https://travis-ci.org/vdubois/aws-sdk-fluent-builder.svg?branch=master)

## Goal

The goal of this package is to simplify the use of the Javascript AWS SDK. AWS SDK node module is a verbose one and sometimes
the needs of developers are really simple. It was originally designed in order to be used within serverless projects,
especially for end-to-end testing of AWS lambdas.

It's an API based on the use of promises.

## Examples

### DynamoDB

```js
const dynamoDbRepository = new DynamoDbBuilder()
  .withTableName('foo')
  .withPartitionKeyName('id')  
  .withSortKeyName('date')  
  .createIfNotExists()
  .build();

const result = await dynamoDbRepository.findOnePartitionKeyAndSortKey('6325', '2020-01-01');
console.log(result);
```

### SNS

```js
const sns = new SnsBuilder()
  .withTopicName('cartEvents')
  .createIfNotExists()
  .build();

await sns.publishMessage({
  type: 'ProductAddedToCart',
  date: '2017-12-20 20:21:35',
  version: '1',
  ...
});
```

### S3

```js
const configurationService = new S3Builder()
  .withBucketName('myBucket')
  .createIfNotExists()
  .asConfigurationService()
  .build();

const configurationValue = await configurationService.get('configurationKey');
console.log(configurationValue);
```

```js
const storageService = new S3Builder()
  .withBucketName('myBucket')
  .createIfNotExists()
  .asStorageService()
  .build();

const files = await storageService.listFiles();
console.console.log(files);
```

```js
const hostingService = new S3Builder()
  .withBucketName('myBucket')
  .createIfNotExists()
  .asHostingService()
  .build();

await hostingService.uploadFilesFromDirectory('/directory/path');
```

### Lambda

```js
const lambdaService = new LambdaBuilder().withName('my-lambda-name').build;
const result = await lambdaService.invoke({attr: 'value'}); // no need to create the payload object
```

## Todos

* [FIX] S3 Hosting which generates a 403 error
