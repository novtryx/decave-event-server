import { Test, TestingModule } from '@nestjs/testing';
import { InfluencersService } from './influencers.service';

describe('InfluencersService', () => {
  let service: InfluencersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfluencersService],
    }).compile();

    service = module.get<InfluencersService>(InfluencersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
