import { S3ConfigurationService } from '../repositories/s3-configuration.service';

export class S3ConfigurationBuilder {

    constructor(private bucketName: string, private sourceFileName = 'config.json') {

    }

    withSourceFileName(sourceFileName: string): S3ConfigurationBuilder {
        this.sourceFileName = sourceFileName;
        return this;
    }

    build(): S3ConfigurationService {
        return new S3ConfigurationService(this.bucketName, this.sourceFileName);
    }
}
