import { LambdaFunction } from '../../repositories/lambda/lambda.function';

export class LambdaBuilder {

  private name: string;

  withName(name: string): LambdaBuilder {
    this.name = name;
    return this;
  }

  build(): LambdaFunction {
    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION environment variable must be set');
    }
    if (!this.name) {
      throw new Error('Lambda name is mandatory');
    }
    return new LambdaFunction(this.name);
  }
}
