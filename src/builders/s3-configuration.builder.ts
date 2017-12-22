import { S3ConfigurationService } from '../repositories/s3-configuration.service';

export class S3ConfigurationBuilder {

    constructor(private bucketName: string) {

    }

    build(): S3ConfigurationService {
        return new S3ConfigurationService(this.bucketName);
    }
}
