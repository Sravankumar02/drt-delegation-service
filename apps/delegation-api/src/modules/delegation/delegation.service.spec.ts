import { Test, TestingModule } from '@nestjs/testing';
import { DelegationService } from './delegation.service';
import { NumbatElasticService } from '../../common/services/numbat-communication/numbat-elastic.service';
import { CacheManagerService } from '../../common/services/cache-manager/cache-manager.service';
import { NumbatProxyService } from '../../common/services/numbat-communication/numbat-proxy.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('DelegationService', () => {
  let service: DelegationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelegationService,
        { provide: NumbatElasticService, useValue: {} },
        { provide: CacheManagerService, useValue: {} },
        { provide: NumbatProxyService, useValue: {} },
        { provide: WINSTON_MODULE_PROVIDER, useValue: {} },
      ],
    }).compile();

    service = module.get<DelegationService>(DelegationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
