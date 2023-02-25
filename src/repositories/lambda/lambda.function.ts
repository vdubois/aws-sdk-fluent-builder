import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {TextEncoder} from 'util';

export class LambdaFunction {

  constructor(private name: string, private lambda = new LambdaClient({region: process.env.AWS_REGION})) {
  }

  invoke(payload: object): Promise<any> {
    return this.lambda.send(new InvokeCommand({
      FunctionName: this.name,
      Payload: new TextEncoder().encode(JSON.stringify({body: JSON.stringify(payload)}))
    }));
  }
}
