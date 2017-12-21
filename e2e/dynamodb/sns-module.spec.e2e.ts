import CloudWatch = require('aws-sdk/clients/cloudwatch');
import { SnsBuilder } from '../../src/builders/sns.builder';

xdescribe('SNS module', () => {

    describe('publishMessage function', () => {

        it('should ', done => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName('sns-module-e2e')
                .createIfNotExists()
                .build();
            const cloudwatch = new CloudWatch({region: process.env.AWS_REGION});
            sns.publishMessage({test: 'value'})
                .then(() => cloudwatch.listMetrics().promise())
                .then(results => results.Metrics.filter(metric => metric.Namespace === 'AWS/SNS'));
                // .then(snsEvents => snsEvents.);
            // const cloudwatchEvents = new CloudWatchEvents({region: process.env.AWS_REGION});

            // WHEN

            // THEN

        });
    });
});
