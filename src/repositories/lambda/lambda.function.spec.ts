import { LambdaFunction } from './lambda.function';
import { Lambda } from 'aws-sdk';

describe('LambdaFunction', () => {
    describe('invoke function', () => {

        it('should throw an error if aws sdk throws an error', async done => {
            // GIVEN
            const mockedLambda = {
                invoke: () => ({
                    // @ts-ignore
                    promise: () => Promise.reject('lambda error')
                })
            };

            // WHEN
            try {
                // @ts-ignore
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
            const invokeMock = jest.fn((params: Lambda.Types.InvocationRequest) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedLambda = {
                invoke: invokeMock
            };

            try {
                // WHEN
                // @ts-ignore
                const lambdaFunction = new LambdaFunction('mock', mockedLambda);
                await lambdaFunction.invoke({prop1: 'value', prop2: 2});
                expect(invokeMock).toHaveBeenCalledTimes(1);
                expect(invokeMock).toHaveBeenCalledWith({
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
