import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { LocalStorageService } from '../storage/local-storage.service';
import { decryptFile } from '../utils/encryption.util';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';

import { Public } from '../../../common/decorators/public.decorator';
import * as crypto from 'crypto';

@ApiTags('storage')
@Controller('local-storage')
export class LocalStorageController {
  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Download file from local storage' })
  async downloadFile(
    @Param('key') key: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(token, 'base64').toString('utf-8'),
      ) as { payload: string; signature: string };

      const secret = this.configService.get<string>(
        'storage.encryption.key',
      ) as string;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(decoded.payload)
        .digest('hex');

      // Use timingSafeEqual to prevent timing attacks
      if (
        !crypto.timingSafeEqual(
          Buffer.from(decoded.signature),
          Buffer.from(expectedSignature),
        )
      ) {
        throw new BadRequestException('Invalid token signature');
      }

      const parsedPayload = JSON.parse(decoded.payload) as {
        key: string;
        exp: number;
      };
      const { key: tokenKey, exp } = parsedPayload;

      if (tokenKey !== key) {
        throw new BadRequestException('Invalid token for this file');
      }
      if (Date.now() > exp) {
        throw new BadRequestException('Token has expired');
      }
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException('Invalid token');
    }

    try {
      const buffer = await this.localStorageService.download(key);

      const ivBuffer = buffer.subarray(0, 16);
      const encryptedData = buffer.subarray(16);

      const encryptionKey = this.configService.get<string>(
        'storage.encryption.key',
      ) as string;
      const decrypted = decryptFile(
        encryptedData,
        encryptionKey,
        ivBuffer.toString('hex'),
      );

      const filename = key.split('-').slice(1).join('-') || key;
      const ext = path.extname(filename).toLowerCase();

      let contentType = 'application/octet-stream';
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.doc' || ext === '.docx') {
        contentType = 'application/msword';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.send(decrypted);
    } catch {
      throw new NotFoundException('File not found or could not be decrypted');
    }
  }
}
