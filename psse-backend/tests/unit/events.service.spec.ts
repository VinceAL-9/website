import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/events/events.service';
import { PrismaService } from 'src/prisma';
import { CloudinaryService } from 'src/cloudinary';
import { NotFoundException } from '@nestjs/common';
import { cloudinaryMock } from '../mocks/cloudinary.mock';

describe('EventsService', () => {
  let service: EventsService;

  const mockPrismaService = {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const mockEvents = [{ id: '1', title: 'Event 1' }];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll();
      expect(result).toEqual(mockEvents);
      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { date: 'desc' },
      });
    });

    it('should filter by isUpcoming', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([]);
      await service.findAll(true);
      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith({
        where: { isUpcoming: true },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const mockEvent = { id: '1', title: 'Event 1' };
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne('1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event is not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createDto = {
        title: 'New Event',
        description: 'Description',
        date: '2025-01-01T00:00:00.000Z',
        location: 'Venue',
        imageUrl: 'http://image.url',
        isUpcoming: true,
      };

      const mockEvent = {
        id: '1',
        ...createDto,
        date: new Date(createDto.date),
      };
      mockPrismaService.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(createDto);
      expect(result).toEqual(mockEvent);
      expect(mockPrismaService.event.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an event and delete old image if imageUrl changes', async () => {
      const existingEvent = { id: '1', imageUrl: 'http://old.url' };
      mockPrismaService.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaService.event.update.mockResolvedValue({
        ...existingEvent,
        imageUrl: 'http://new.url',
      });

      await service.update('1', { imageUrl: 'http://new.url' });

      expect(cloudinaryMock.deleteImage).toHaveBeenCalledWith('http://old.url');
      expect(mockPrismaService.event.update).toHaveBeenCalled();
    });

    it('should proceed with update even if Cloudinary delete fails', async () => {
      const existingEvent = { id: '1', imageUrl: 'http://old.url' };
      mockPrismaService.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaService.event.update.mockResolvedValue({
        ...existingEvent,
        imageUrl: 'http://new.url',
      });

      cloudinaryMock.deleteImage.mockRejectedValueOnce(
        new Error('Cloudinary error'),
      );

      await expect(
        service.update('1', { imageUrl: 'http://new.url' }),
      ).resolves.toBeDefined();
      expect(mockPrismaService.event.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);
      await expect(service.update('1', { title: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an event and its image from Cloudinary', async () => {
      const existingEvent = { id: '1', imageUrl: 'http://image.url' };
      mockPrismaService.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaService.event.delete.mockResolvedValue(existingEvent);

      await service.remove('1');

      expect(cloudinaryMock.deleteImage).toHaveBeenCalledWith(
        'http://image.url',
      );
      expect(mockPrismaService.event.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should proceed with delete even if Cloudinary delete fails', async () => {
      const existingEvent = { id: '1', imageUrl: 'http://image.url' };
      mockPrismaService.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaService.event.delete.mockResolvedValue(existingEvent);

      cloudinaryMock.deleteImage.mockRejectedValueOnce(
        new Error('Cloudinary error'),
      );

      await expect(service.remove('1')).resolves.toBeDefined();
      expect(mockPrismaService.event.delete).toHaveBeenCalled();
    });
  });
});
