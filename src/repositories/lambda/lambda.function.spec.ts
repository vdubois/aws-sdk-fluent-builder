import { LambdaFunction } from './lambda.function';

describe('LambdaFunction', () => {
    describe('invoke function', () => {

        it('should throw an error if aws sdk throws an error', async done => {
            // GIVEN
            const mockedLambda = jasmine.createSpyObj('Lambda', ['invoke']);
            mockedLambda.invoke.and.returnValue({
                promise: () => Promise.reject('lambda error')
            });

            // WHEN
            try {
                const lambdaFunction = new LambdaFunction('mock', mockedLambda);
                await lambdaFunction.invoke({});
                done.fail('we should never reach here because aws sdk should have thrown an error');
            } catch (exception) {
                // THEN
                expect(exception).toEqual('lambda error');
                done();
            }
        });

        it('should call aws sdk invoke function', async done => {
            // GIVEN
            const mockedLambda = jasmine.createSpyObj('Lambda', ['invoke']);
            mockedLambda.invoke.and.returnValue({
                promise: () => Promise.resolve({})
            });

            try {
                // WHEN
                const lambdaFunction = new LambdaFunction('mock', mockedLambda);
                await lambdaFunction.invoke({prop1: 'value', prop2: 2});
                expect(mockedLambda.invoke).toHaveBeenCalledTimes(1);
                expect(mockedLambda.invoke).toHaveBeenCalledWith({
                    FunctionName: 'mock',
                    Payload: JSON.stringify({body: JSON.stringify({prop1: 'value', prop2: 2})})
                });
                done();
            } catch (exception) {
                done.fail('we should never reach here because aws sdk invoke should work');
            }
        });
    });
});
