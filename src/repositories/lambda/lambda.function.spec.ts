import { LambdaFunction } from './lambda.function';

describe('LambdaFunction', () => {
  describe('invoke function', () => {

    it('should throw an error if aws sdk throws an error', done => {
      // GIVEN
      const mockedLambda = jasmine.createSpyObj('Lambda', ['invoke']);
      mockedLambda.invoke.and.returnValue({
        promise: () => Promise.reject('lambda error')
      });

      // WHEN
      const lambdaFunction = new LambdaFunction('mock', mockedLambda).invoke({})
        .then(() => done.fail('we should never reach here because aws sdk should have thrown an error'))
        .catch(exception => {
          // THEN
          expect(exception).toEqual('lambda error');
          done();
        });
    });

    it('should call aws sdk invoke function', done => {
      // GIVEN
      const mockedLambda = jasmine.createSpyObj('Lambda', ['invoke']);
      mockedLambda.invoke.and.returnValue({
        promise: () => Promise.resolve({})
      });

      // WHEN
      const lambdaFunction = new LambdaFunction('mock', mockedLambda).invoke({prop1: 'value', prop2: 2})
        .then(() => {
          expect(mockedLambda.invoke).toHaveBeenCalledTimes(1);
          expect(mockedLambda.invoke).toHaveBeenCalledWith({
            FunctionName: 'mock',
            Payload: JSON.stringify({ body: JSON.stringify({prop1: 'value', prop2: 2}) })
          });
          done();
        })
        .catch(exception => done.fail('we should never reach here because aws sdk invoke should work'));
    });
  });
});
