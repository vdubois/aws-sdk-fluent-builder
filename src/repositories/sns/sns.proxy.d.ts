import { Sns } from './sns';
import { SnsImplementation } from './sns.implementation';
import { SNSClient } from '@aws-sdk/client-sns';
export declare class SnsProxy implements Sns {
    private sns;
    private snsClient;
    constructor(sns: SnsImplementation, snsClient?: SNSClient);
    createIfNotExists(): Promise<any>;
    publishMessage(message: object): Promise<any>;
}
