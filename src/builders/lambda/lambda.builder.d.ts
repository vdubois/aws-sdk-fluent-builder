import { LambdaFunction } from '../../repositories/lambda/lambda.function';
export declare class LambdaBuilder {
    private name;
    withName(name: string): LambdaBuilder;
    build(): LambdaFunction;
}
