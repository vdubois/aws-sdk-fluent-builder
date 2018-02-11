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
  .createIfNotExists()
  .build();

dynamoDbRepository.findAll()
  .then(results => console.log(results));
```

### SNS

```js
const sns = new SnsBuilder()
  .withTopicName('cartEvents')
  .createIfNotExists()
  .build();

sns.publishMessage({
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

configurationService.get('configurationKey')
  .then(configurationValue => console.log(configurationValue));
```

```js
const storageService = new S3Builder()
  .withBucketName('myBucket')
  .createIfNotExists()
  .asStorageService()
  .build();

storageService.listFiles()
  .then(files => console.console.log(files));
```

```js
const hostingService = new S3Builder()
  .withBucketName('myBucket')
  .createIfNotExists()
  .asHostingService()
  .build();

hostingService.uploadFilesFromDirectory('/directory/path')
  .then(result => console.log(result));
```

### Lambda

```js
const lambdaService = new LambdaBuilder().withName('my-lambda-name').build;
lambdaService.invoke({attr: 'value'}) // no need to create the payload object
  .then(result => console.log(result));
```

## Todos

* [FIX] S3 Hosting which generates a 403 error
* Differentiate hash key and range key for DynamoDB
* Handle autoscaling with DynamoDB
