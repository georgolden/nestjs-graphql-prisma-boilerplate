import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chat.findMany({
      include: { messages: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.chat.findUnique({
      where: { id },
      include: { messages: true },
    });
  }

  async create(data: { title: string; type: string }) {
    return this.prisma.chat.create({
      data,
      include: { messages: true },
    });
  }

  async addMessage(chatId: number, data: { content: string; role: string }) {
    return this.prisma.message.create({
      data: {
        ...data,
        chatId,
      },
    });
  }
}
