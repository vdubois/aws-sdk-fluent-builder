import { S3ConfigurationService } from '../../../repositories/s3/s3-configuration.service';
import * as fs from 'fs';

export class S3ConfigurationBuilder {

    private sourceFileName = 'config.json';
    private contents: object;

    constructor(private bucketName: string) {

    }

    withSourceFileName(sourceFileName: string): S3ConfigurationBuilder {
        this.sourceFileName = sourceFileName;
        return this;
    }

    withContents(contents: object): S3ConfigurationBuilder {
        this.contents = contents;
        return this;
    }

    withFileContents(filePath: string): S3ConfigurationBuilder {
        try {
            const fileContent = fs.readFileSync(filePath);
            this.contents = JSON.parse(fileContent.toString());
            return this;
        } catch (exception) {
            throw new Error('File ' + filePath + ' does not exist');
        }
    }

    build(): S3ConfigurationService {
        return new S3ConfigurationService(this.bucketName, this.sourceFileName, this.contents);
    }
}
