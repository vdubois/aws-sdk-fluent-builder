import { S3StorageService } from '../../../repositories/s3/s3-storage.service';

export class S3StorageBuilder {

    constructor(private bucketName: string, private mustCreateBeforeUse: boolean) {
    }

    build(): S3StorageService {
        return new S3StorageService(this.bucketName, this.mustCreateBeforeUse);
    }
}
