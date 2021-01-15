import { Sns } from './sns';
import * as SNS from 'aws-sdk/clients/sns';
export declare class SnsImplementation implements Sns {
    private _topicName;
    private snsClient;
    constructor(_topicName: string, snsClient?: SNS);
    publishMessage(message: object): Promise<any>;
    private findTopicArn;
    get topicName(): string;
}
