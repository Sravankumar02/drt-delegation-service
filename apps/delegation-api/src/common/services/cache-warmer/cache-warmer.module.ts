import { Module } from '@nestjs/common';
import { CacheWarmerService } from './cache-warmer.service';
import { NumbatCommunicationModule } from '../numbat-communication/numbat-communication.module';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { CacheWarmerScheduler } from './cache-warmer.scheduler';
import { AssetsModule } from '../assets/assets.module';
import { IdentitiesLoaderModule } from '../provider-manager/identities-loader/identities-loader.module';

@Module({
  imports: [
    NumbatCommunicationModule,
    CacheManagerModule,
    AssetsModule,
    IdentitiesLoaderModule,
  ],
  providers: [
    CacheWarmerService,
    CacheWarmerScheduler,
  ],
  exports: [
    CacheWarmerService,
  ],
})
export class CacheWarmerModule { }
