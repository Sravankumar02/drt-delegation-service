import { Module } from '@nestjs/common';
import { NumbatElasticService } from './numbat-elastic.service';
import { NumbatApiService } from './numbat-api.service';
import { NumbatProxyService } from './numbat-proxy.service';
import { RedisModule } from 'nestjs-redis';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { LoggingModule } from '../../../logging.module';
import { HttpModule } from '../http';

@Module({
  providers: [
    NumbatElasticService,
    NumbatApiService,
    NumbatProxyService,
  ],
  imports: [
    RedisModule.register({
      db: parseInt(process.env.REDIS_DB),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_PREFIX,
      sentinels: [{
        host: process.env.SENTINEL_URL,
        port: parseInt(process.env.SENTINEL_PORT),
      }],
      name: process.env.SENTINEL_NAME,
    }),
    CacheManagerModule,
    LoggingModule,
    HttpModule,
  ],
  exports: [
    NumbatElasticService,
    NumbatApiService,
    NumbatProxyService,
  ],
})
export class NumbatCommunicationModule { }
