import {expect, test, describe, beforeEach} from 'vitest';
import { LambdaBuilder } from './lambda.builder';

describe('Lambda builder', () => {

  beforeEach(() => {
    process.env.AWS_REGION = 'test';
  });

  describe('withName function', () => {

    test('should store lambda name', () => {
      // GIVEN

      // WHEN
      const lambdaFunction = new LambdaBuilder().withName('lambda-name').build();

      // THEN
      expect(lambdaFunction['name']).not.toBeNull();
      expect(lambdaFunction['name']).toEqual('lambda-name');
    });
  });

  describe('build function', () => {
    test('should throw an error if AWS_REGION environment variable is not set', () => {
      // GIVEN
      const lambdaBuilder = new LambdaBuilder();
      process.env = {};

      try {
        // WHEN
        lambdaBuilder.build();
        throw new Error('We should never reach here because AWS_REGION environment variable is not set');
      } catch (exception) {
        // THEN
        expect(exception.message).toEqual('AWS_REGION environment variable must be set');
      }
    });

    test('should throw an error if name is not set', () => {
      // GIVEN
      const lambdaBuilder = new LambdaBuilder();

      try {
        // WHEN
        lambdaBuilder.build();
        throw new Error('We should never reach here because lambda name is not set');
      } catch (exception) {
        // THEN
        expect(exception.message).toEqual('Lambda name is mandatory');
      }
    });
  });
});
