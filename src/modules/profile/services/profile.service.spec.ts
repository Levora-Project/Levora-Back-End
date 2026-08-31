import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: {
            userProfiles: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            userSkills: {
              deleteMany: jest.fn(),
              create: jest.fn(),
            },
            userLanguages: {
              deleteMany: jest.fn(),
              create: jest.fn(),
            },
            userEducations: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            skillsMaster: {
              findUnique: jest.fn(),
            },
            languagesMaster: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculateCompletionPct should return 0 for empty profile', () => {
    expect(service.calculateCompletionPct({})).toBe(0);
  });

  it('calculateLastCompletedStep should return 0 for empty profile', () => {
    expect(service.calculateLastCompletedStep({})).toBe(0);
  });
});
