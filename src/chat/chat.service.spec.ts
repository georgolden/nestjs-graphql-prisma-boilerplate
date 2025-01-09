import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { Chat, Message } from './dto/chat.types';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  const mockChat: Chat = {
    id: 1,
    title: 'Test Chat',
    type: 'group',
    metadata: 'test metadata',
    createdAt: new Date(),
    messages: []
  };

  const mockMessage: Message = {
    id: 1,
    chatId: 1,
    content: 'Test message',
    role: 'user',
    timestamp: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            chat: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            message: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('returns empty array when no chats exist', async () => {
      jest.spyOn(prisma.chat, 'findMany').mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('returns all chats with their messages', async () => {
      const mockChatsWithMessages = [
        { ...mockChat, messages: [mockMessage] },
        { ...mockChat, id: 2, messages: [] }
      ];
      jest.spyOn(prisma.chat, 'findMany').mockResolvedValue(mockChatsWithMessages);
      const result = await service.findAll();
      expect(result).toEqual(mockChatsWithMessages);
    });
  });

  describe('findOne', () => {
    it('returns null for non-existent chat', async () => {
      jest.spyOn(prisma.chat, 'findUnique').mockResolvedValue(null);
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });

    it('returns chat with messages when found', async () => {
      const chatWithMessages = { ...mockChat, messages: [mockMessage] };
      jest.spyOn(prisma.chat, 'findUnique').mockResolvedValue(chatWithMessages);
      const result = await service.findOne(1);
      expect(result).toEqual(chatWithMessages);
    });
  });

  describe('create', () => {
    it('creates chat with valid data', async () => {
      jest.spyOn(prisma.chat, 'create').mockResolvedValue(mockChat);
      const result = await service.create({ title: 'Test Chat', type: 'group' });
      expect(result).toEqual(mockChat);
    });

    it('includes empty messages array in new chat', async () => {
      const newChat = { ...mockChat, messages: [] };
      jest.spyOn(prisma.chat, 'create').mockResolvedValue(newChat);
      const result = await service.create({ title: 'Test Chat', type: 'group' });
      expect(result.messages).toEqual([]);
    });
  });

  describe('addMessage', () => {
    it('adds message to existing chat', async () => {
      jest.spyOn(prisma.message, 'create').mockResolvedValue(mockMessage);
      const result = await service.addMessage(1, { content: 'Test message', role: 'user' });
      expect(result).toEqual(mockMessage);
    });

    it('sets correct chatId when adding message', async () => {
      const chatId = 1;
      jest.spyOn(prisma.message, 'create').mockResolvedValue(mockMessage);
      await service.addMessage(chatId, { content: 'Test message', role: 'user' });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          content: 'Test message',
          role: 'user',
          chatId
        }
      });
    });
  });
});
