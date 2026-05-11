import { Test, TestingModule } from '@nestjs/testing';
import { RedlockService } from './redlock.service';
import { RedisService } from 'nestjs-redis';

describe('RedlockService', () => {
  let service: RedlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedlockService,
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              setnx: jest.fn(),
              expire: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedlockService>(RedlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});