import { Test, TestingModule } from '@nestjs/testing';
import { DelegationController } from './delegation.controller';
import { DelegationService } from './delegation.service';

describe('DelegationController', () => {
  let controller: DelegationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DelegationController],
      providers: [
        {
          provide: DelegationService,
          useValue: {
            getAllContractDataForUser: jest.fn(),
            getDelegationForUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DelegationController>(DelegationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});