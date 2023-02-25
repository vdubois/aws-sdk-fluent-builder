import {
    CreateBucketCommand, GetObjectCommand,
    GetObjectCommandInput,
    ListBucketsCommand, PutObjectCommand,
    S3Client,
    waitUntilBucketExists,
    waitUntilObjectExists
} from '@aws-sdk/client-s3';
import {MAX_WAIT_TIME_IN_SECONDS} from '../configuration/configuration';

export class S3ConfigurationService {

    private configuration: object;

    constructor(private _bucketName: string, private fileName: string,
                private contents: object,
                private mustCreateBeforeUse: boolean,
                private s3Client = new S3Client({region: process.env.AWS_REGION})) {
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
            const {Buckets} = await this.s3Client.send(new ListBucketsCommand({}));
            if (Buckets.some(bucket => bucket.Name === this.bucketName)) {
                return Promise.resolve({});
            } else {
                await this.s3Client.send(new CreateBucketCommand({Bucket: this.bucketName}));
                return waitUntilBucketExists(
                    {client: this.s3Client, maxWaitTime: MAX_WAIT_TIME_IN_SECONDS},
                    {Bucket: this.bucketName});
            }
        } else {
            return Promise.resolve({});
        }
    }

    private async overrideConfiguration(): Promise<any> {
        if (this.contents) {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: this.fileName,
                Body: JSON.stringify(this.contents, null, 2)
            }));
            return waitUntilObjectExists(
                {client: this.s3Client, maxWaitTime: MAX_WAIT_TIME_IN_SECONDS},
                {Bucket: this.bucketName, Key: this.fileName});
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
                const getObjectParams: GetObjectCommandInput = {
                    Bucket: this._bucketName,
                    Key: this.fileName
                };
                const result = await this.s3Client.send(new GetObjectCommand(getObjectParams));
                const fileContent = await result.Body.transformToString('utf8');
                this.configuration = JSON.parse(fileContent);
                return this.configuration;
            } catch (error) {
                throw new Error(`${this.fileName} file does not exist in bucket`);
            }
        }
    }
}
