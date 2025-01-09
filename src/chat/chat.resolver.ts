import { Resolver, Query, Mutation, Subscription, Args, Int } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import type { PubSubEngine } from 'graphql-subscriptions';
import { ChatService } from './chat.service';
import { Chat, Message } from './dto/chat.types';

const pubSub: PubSubEngine = new PubSub();

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private chatService: ChatService) {}

  @Query(() => [Chat])
  async chats() {
    return this.chatService.findAll();
  }

  @Query(() => Chat)
  async chat(@Args('id', { type: () => Int }) id: number) {
    return this.chatService.findOne(id);
  }

  @Mutation(() => Chat)
  async createChat(
    @Args('title') title: string,
    @Args('type') type: string,
  ) {
    const chat = await this.chatService.create({ title, type });
    pubSub.publish('chatCreated', { chatCreated: chat });
    return chat;
  }

  @Mutation(() => Message)
  async sendMessage(
    @Args('chatId', { type: () => Int }) chatId: number,
    @Args('content') content: string,
    @Args('role') role: string,
  ) {
    const message = await this.chatService.addMessage(chatId, { content, role });
    pubSub.publish('messageCreated', { messageCreated: message, chatId });
    return message;
  }
  @Subscription(() => Chat)
  chatCreated() {
    return pubSub.asyncIterableIterator('chatCreated');
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => 
      payload.messageCreated.chatId === variables.chatId
  })
  messageCreated(@Args('chatId', { type: () => Int }) chatId: number) {
    return pubSub.asyncIterableIterator('messageCreated');
  }
}
