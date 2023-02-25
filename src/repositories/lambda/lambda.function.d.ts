import { LambdaClient } from '@aws-sdk/client-lambda';
export declare class LambdaFunction {
    private name;
    private lambda;
    constructor(name: string, lambda?: LambdaClient);
    invoke(payload: object): Promise<any>;
}
