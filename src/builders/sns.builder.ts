import { Sns } from '../repositories/sns';
import { SnsProxy } from '../repositories/sns.proxy';
import { SnsImplementation } from '../repositories/sns.implementation';

export class SnsBuilder {

    private topicName: string;
    private mustCreateBeforeUse = false;

    withTopicName(topicName: string): SnsBuilder {
        this.topicName = topicName;
        return this;
    }

    createIfNotExists(): SnsBuilder {
        this.mustCreateBeforeUse = true;
        return this;
    }

    build(): Sns {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.topicName) {
            throw new Error('Topic name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new SnsProxy(new SnsImplementation(this.topicName));
        }
        return new SnsImplementation(this.topicName);
    }
}
