import { Lambda } from 'aws-sdk';
export declare class LambdaFunction {
    private name;
    private lambda;
    constructor(name: string, lambda?: Lambda);
    invoke(payload: object): Promise<any>;
}
