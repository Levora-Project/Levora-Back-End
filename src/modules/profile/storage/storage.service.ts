import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export const StorageServiceProvider = {
  provide: STORAGE_SERVICE,
  useFactory: (configService: ConfigService) => {
    const provider = configService.get<string>('storage.provider');
    if (provider === 's3') {
      return new S3StorageService(configService);
    }
    return new LocalStorageService(configService);
  },
  inject: [ConfigService],
};
