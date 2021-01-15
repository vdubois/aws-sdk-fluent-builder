import * as S3 from 'aws-sdk/clients/s3';
import { GetObjectRequest } from 'aws-sdk/clients/s3';

export class S3ConfigurationService {

    private configuration: object;

    constructor(private _bucketName: string, private fileName: string,
                private contents: object,
                private mustCreateBeforeUse: boolean,
                private s3Client = new S3({region: process.env.AWS_REGION})) {
    }

    get bucketName(): string {
        return this._bucketName;
    }

    /**
     * Get a configuration value using its key (based on JSON object)
     * @param {string} configurationKey
     * @returns {Promise<any>}
     */
    async get(configurationKey: string): Promise<any> {
        const configuration = await this.loadConfiguration();
        if (configuration[configurationKey] !== undefined) {
            return Promise.resolve(configuration[configurationKey]);
        } else {
            throw new Error(`No key '${configurationKey}' present in configuration`);
        }
    }

    /**
     * Get the configuration object
     * @returns {Promise<any>}
     */
    all(): Promise<any> {
        return this.loadConfiguration();
    }

    private async createBucketIfNecesary(): Promise<any> {
        if (this.mustCreateBeforeUse) {
            const { Buckets } = await this.s3Client.listBuckets().promise();
            if (Buckets.some(bucket => bucket.Name === this.bucketName)) {
                return Promise.resolve({});
            } else {
                await this.s3Client.createBucket({Bucket: this.bucketName}).promise();
                return this.s3Client.waitFor('bucketExists', {Bucket: this.bucketName});
            }
        } else {
            return Promise.resolve({});
        }
    }

    private async overrideConfiguration(): Promise<any> {
        if (this.contents) {
            await this.s3Client.upload({
                Bucket: this.bucketName,
                Key: this.fileName,
                Body: JSON.stringify(this.contents, null, 2)
            }).promise();
            return this.s3Client.waitFor('objectExists', {Bucket: this.bucketName, Key: this.fileName});
        } else {
            return Promise.resolve({});
        }
    }

    private async loadConfiguration(): Promise<any> {
        if (this.configuration) {
            return Promise.resolve(this.configuration);
        } else {
            await this.createBucketIfNecesary();
            await this.overrideConfiguration();
            try {
                const getObjectParams: GetObjectRequest = {
                    Bucket: this._bucketName,
                    Key: this.fileName
                };
                const result = await this.s3Client.getObject(getObjectParams).promise();
                this.configuration = JSON.parse(result.Body.toString());
                return this.configuration;
            } catch (error) {
                throw new Error(`${this.fileName} file does not exist in bucket`);
            }
        }
    }
}
