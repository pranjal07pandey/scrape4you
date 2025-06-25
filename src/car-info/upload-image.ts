import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}-${file.originalname}`, // Unique file name
      Body: file.buffer,
      ContentType: file.mimetype,
    //   ACL: 'public-read', // Make the file publicly accessible (optional)
    };

    const result = await this.s3.upload(params).promise();
    return result.Location; // Returns the public URL of the file
  }

  async uploadProfilePic(file: Express.Multer.File){

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME_PROFILE,
      Key: `${uuidv4()}-${file.originalname}`, // Unique file name
      Body: file.buffer,
      ContentType: file.mimetype,
    //   ACL: 'public-read', // Make the file publicly accessible (optional)
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;

  }
}