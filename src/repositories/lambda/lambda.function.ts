import { Lambda } from 'aws-sdk';

export class LambdaFunction {

  constructor(private name: string, private lambda = new Lambda({region: process.env.AWS_REGION})) {
  }

  invoke(payload: object): Promise<any> {
    return this.lambda.invoke({
      FunctionName: this.name,
      Payload: JSON.stringify({ body: JSON.stringify(payload) })
    }).promise();
  }
}
