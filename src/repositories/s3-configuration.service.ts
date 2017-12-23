import S3 = require('aws-sdk/clients/s3');
import { GetObjectRequest } from 'aws-sdk/clients/s3';

export class S3ConfigurationService {

    private configuration: object;

    constructor(private bucketName: string, private fileName: string,
                private s3Client = new S3({ region: process.env.AWS_REGION })) {
    }

    get(configurationKey: string): Promise<any> {
        return this.loadConfiguration()
            .then(configuration => {
                if (configuration[configurationKey] !== undefined) {
                    return Promise.resolve(configuration[configurationKey]);
                } else {
                    throw new Error(`No key '${configurationKey}' present in configuration`);
                }
            });
    }

    private loadConfiguration(): Promise<any> {
        if (this.configuration) {
            return Promise.resolve(this.configuration);
        } else {
            const getObjectParams: GetObjectRequest = {
                Bucket: this.bucketName,
                Key: this.fileName
            };
            return this.s3Client.getObject(getObjectParams)
                .promise()
                .then(result => {
                    this.configuration = JSON.parse(result.Body.toString());
                    return this.configuration;
                })
                .catch(exception => {
                    throw new Error(`${this.fileName} file does not exist in bucket`);
                });
        }
    }
}
