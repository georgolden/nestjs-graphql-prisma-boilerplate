import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateById(userId: number, input: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: input,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(where: Partial<User>): Promise<User | null> {
    return this.prisma.user.findFirst({ where });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByPermalink(permalink: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { permalink } });
  }
}
