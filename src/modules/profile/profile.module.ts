import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';

import { ReferenceController } from './controllers/reference.controller';
import { ReferenceService } from './services/reference.service';

import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { StorageServiceProvider } from './storage/storage.service';
import { LocalStorageController } from './controllers/local-storage.controller';
import { LocalStorageService } from './storage/local-storage.service';

@Module({
  controllers: [
    ProfileController,
    ReferenceController,
    DocumentsController,
    LocalStorageController,
  ],
  providers: [
    ProfileService,
    ReferenceService,
    DocumentsService,
    StorageServiceProvider,
    LocalStorageService,
  ],
})
export class ProfileModule {}
