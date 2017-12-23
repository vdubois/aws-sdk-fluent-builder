import { S3ConfigurationService } from '../repositories/s3-configuration.service';

export class S3ConfigurationBuilder {

    private sourceFileName = 'config.json';

    constructor(private bucketName: string) {

    }

    withSourceFileName(sourceFileName: string): S3ConfigurationBuilder {
        this.sourceFileName = sourceFileName;
        return this;
    }

    build(): S3ConfigurationService {
        return new S3ConfigurationService(this.bucketName, this.sourceFileName);
    }
}
