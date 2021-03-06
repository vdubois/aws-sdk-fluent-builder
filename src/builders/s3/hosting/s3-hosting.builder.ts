import { S3HostingService } from '../../../repositories/s3/s3-hosting.service';

export class S3HostingBuilder {

    constructor(private bucketName: string, private mustCreateBeforeUse: boolean) {
    }

    build(): S3HostingService {
        return new S3HostingService(this.bucketName, this.mustCreateBeforeUse);
    }
}
