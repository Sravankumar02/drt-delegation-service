import { Module } from '@nestjs/common';
import { NumbatCommunicationModule } from '../numbat-communication/numbat-communication.module';
import { ProviderManagerService } from './provider-manager.service';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { ProfileLoaderModule } from './profile/loader/profile-loader.module';
import { IdentitiesLoaderModule } from './identities-loader/identities-loader.module';

@Module({
  imports: [
    NumbatCommunicationModule,
    CacheManagerModule,
    ProfileLoaderModule,
    IdentitiesLoaderModule,
  ],
  providers: [
    ProviderManagerService,
  ],
  exports: [
    ProviderManagerService,
  ],
})
export class ProviderManagerModule { }
