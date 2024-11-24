import { Test, TestingModule } from '@nestjs/testing';
import { CarInfoController } from './car-info.controller';

describe('CarInfoController', () => {
  let controller: CarInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarInfoController],
    }).compile();

    controller = module.get<CarInfoController>(CarInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
