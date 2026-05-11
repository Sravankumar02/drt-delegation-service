import { Test, TestingModule } from '@nestjs/testing';
import { TransactionProcessorService } from './transaction-processor.service';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import { ProviderManagerService } from '../provider-manager/provider-manager.service';
import { NumbatProxyService } from '../numbat-communication/numbat-proxy.service';
import { CacheWarmerService } from '../cache-warmer/cache-warmer.service';
import { ApiMetricsService } from '../metrics/api.metrics.service';
import { PluginService } from '../../plugins/plugin.service';
import { NumbatElasticService } from '../numbat-communication/numbat-elastic.service';

describe('TransactionProcessorService', () => {
  let service: TransactionProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionProcessorService,
        { provide: CacheManagerService, useValue: {} },
        { provide: ProviderManagerService, useValue: {} },
        { provide: NumbatProxyService, useValue: {} },
        { provide: CacheWarmerService, useValue: {} },
        { provide: ApiMetricsService, useValue: {} },
        { provide: PluginService, useValue: {} },
        { provide: NumbatElasticService, useValue: {} },
      ],
    }).compile();

    service = module.get<TransactionProcessorService>(TransactionProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});