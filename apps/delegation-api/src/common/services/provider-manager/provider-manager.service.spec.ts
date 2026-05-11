import { Test, TestingModule } from '@nestjs/testing';
import { ProviderManagerService } from './provider-manager.service';
import { NumbatProxyService } from '../numbat-communication/numbat-proxy.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProfileLoaderService } from './profile/loader/profile-loader.service';
import { IdentitiesLoaderService } from './identities-loader/identities-loader.service';

describe('ProviderManagerService', () => {
  let service: ProviderManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderManagerService,
        { provide: NumbatProxyService, useValue: {} },
        { provide: WINSTON_MODULE_PROVIDER, useValue: {} },
        { provide: ProfileLoaderService, useValue: {} },
        { provide: IdentitiesLoaderService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProviderManagerService>(ProviderManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
