import { Test, TestingModule } from '@nestjs/testing';
import { OfficersService } from 'src/officers/officers.service';
import { PrismaService } from 'src/prisma';
import { NotFoundException } from '@nestjs/common';
import { OfficerCategory } from '@prisma/client';

describe('OfficersService', () => {
  let service: OfficersService;

  const mockPrismaService = {
    officer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OfficersService>(OfficersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all officers ordered by order', async () => {
      const mockOfficers = [{ id: '1', name: 'Officer 1' }];
      mockPrismaService.officer.findMany.mockResolvedValue(mockOfficers);

      const result = await service.findAll();
      expect(result).toEqual(mockOfficers);
      expect(mockPrismaService.officer.findMany).toHaveBeenCalledWith({
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an officer', async () => {
      const mockOfficer = { id: '1', name: 'Officer 1' };
      mockPrismaService.officer.findUnique.mockResolvedValue(mockOfficer);

      const result = await service.findOne('1');
      expect(result).toEqual(mockOfficer);
    });

    it('should throw NotFoundException if officer is not found', async () => {
      mockPrismaService.officer.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an officer', async () => {
      const createDto = {
        name: 'John Doe',
        position: 'President',
        category: 'EXEC' as OfficerCategory,
        academicYear: '2024-2025',
        order: 1,
      };

      const mockOfficer = { id: '1', ...createDto, photoUrl: '' };
      mockPrismaService.officer.create.mockResolvedValue(mockOfficer);

      const result = await service.create(createDto);
      expect(result).toEqual(mockOfficer);
      expect(mockPrismaService.officer.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an officer', async () => {
      const existingOfficer = { id: '1', name: 'John' };
      mockPrismaService.officer.findUnique.mockResolvedValue(existingOfficer);
      mockPrismaService.officer.update.mockResolvedValue({
        ...existingOfficer,
        name: 'Jane',
      });

      const result = await service.update('1', { name: 'Jane' });
      expect(result.name).toBe('Jane');
    });

    it('should throw NotFoundException if officer does not exist', async () => {
      mockPrismaService.officer.findUnique.mockResolvedValue(null);
      await expect(service.update('1', { name: 'Jane' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an officer', async () => {
      const existingOfficer = { id: '1' };
      mockPrismaService.officer.findUnique.mockResolvedValue(existingOfficer);
      mockPrismaService.officer.delete.mockResolvedValue(existingOfficer);

      await service.remove('1');
      expect(mockPrismaService.officer.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if officer does not exist', async () => {
      mockPrismaService.officer.findUnique.mockResolvedValue(null);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
