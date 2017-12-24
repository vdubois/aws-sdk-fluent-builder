import S3 = require('aws-sdk/clients/s3');
import { GetObjectRequest } from 'aws-sdk/clients/s3';

export class S3ConfigurationService {

    private configuration: object;

    constructor(private _bucketName: string, private fileName: string,
                private contents: object,
                private s3Client = new S3({ region: process.env.AWS_REGION })) {
    }

    get bucketName(): string {
        return this._bucketName;
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

    all(): Promise<any> {
        return this.loadConfiguration();
    }

    private overrideConfiguration(): Promise<any> {
        if (this.contents) {
            return this.s3Client.upload({
                Bucket: this.bucketName,
                Key: this.fileName,
                Body: JSON.stringify(this.contents, null, 2)
            }).promise();
        } else {
            return Promise.resolve({});
        }
    }

    private loadConfiguration(): Promise<any> {
        if (this.configuration) {
            return Promise.resolve(this.configuration);
        } else {
            return this.overrideConfiguration()
                .then(() => {
                    const getObjectParams: GetObjectRequest = {
                        Bucket: this._bucketName,
                        Key: this.fileName
                    };
                    return this.s3Client.getObject(getObjectParams).promise();
                })
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
