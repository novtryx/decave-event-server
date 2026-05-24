import { Test, TestingModule } from '@nestjs/testing';
import { InfluencersController } from './influencers.controller';

describe('InfluencersController', () => {
  let controller: InfluencersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfluencersController],
    }).compile();

    controller = module.get<InfluencersController>(InfluencersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
