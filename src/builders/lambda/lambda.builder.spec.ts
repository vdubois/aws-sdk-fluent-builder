import { LambdaBuilder } from './lambda.builder';

describe('Lambda builder', () => {

  beforeEach(() => {
    process.env.AWS_REGION = 'test';
  });

  describe('withName function', () => {

    it('should store lambda name', done => {
      // GIVEN

      // WHEN
      const lambdaFunction = new LambdaBuilder().withName('lambda-name').build();

      // THEN
      expect(lambdaFunction['name']).not.toBeNull();
      expect(lambdaFunction['name']).toEqual('lambda-name');
      done();

    });
  });

  describe('build function', () => {
    it('should throw an error if AWS_REGION environment variable is not set', done => {
      // GIVEN
      const lambdaBuilder = new LambdaBuilder();
      process.env = {};

      try {
        // WHEN
        lambdaBuilder.build();
        done.fail('We should never reach here because AWS_REGION environment variable is not set');
      } catch (exception) {
        // THEN
        expect(exception.message).toEqual('AWS_REGION environment variable must be set');
        done();
      }
    });

    it('should throw an error if name is not set', done => {
      // GIVEN
      const lambdaBuilder = new LambdaBuilder();

      try {
        // WHEN
        lambdaBuilder.build();
        done.fail('We should never reach here because lambda name is not set');
      } catch (exception) {
        // THEN
        expect(exception.message).toEqual('Lambda name is mandatory');
        done();
      }
    });
  });
});
