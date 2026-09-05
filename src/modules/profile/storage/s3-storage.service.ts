import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from '../interfaces/storage.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageService implements StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('storage.s3.region');
    const accessKeyId = this.configService.get<string>(
      'storage.s3.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'storage.s3.secretAccessKey',
    );
    const endpoint = this.configService.get<string>('storage.s3.endpoint');
    this.bucket = this.configService.get<string>('storage.s3.bucket') || '';

    if (!region || !this.bucket || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 configuration is missing required fields');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint: endpoint || undefined,
      forcePathStyle: !!endpoint,
    });
  }

  async upload(
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<{ key: string; url?: string }> {
    try {
      const key = `${uuidv4()}-${filename}`;
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
      });
      await this.s3Client.send(command);
      return { key };
    } catch {
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      const stream = response.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch {
      throw new InternalServerErrorException('Failed to read file from S3');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch {
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch {
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }
}
