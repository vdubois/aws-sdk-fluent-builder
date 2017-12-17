# Typescript fluent API for AWS SDK

![Build status](https://travis-ci.org/vdubois/aws-sdk-fluent-builder.svg?branch=master)

## Goal

The goal of this package is to simplify the use of the Javascript AWS SDK. It's a verbose one and sometimes the needs of developers are really simple.
It was originally created in order to be used within serverless projects, especially for end-to-end testing of AWS lambdas.

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

