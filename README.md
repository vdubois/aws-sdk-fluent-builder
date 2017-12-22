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

configurationService.getKey('configurationKey')
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

## Todos

* Add S3 repository
* Add Cognito repository
