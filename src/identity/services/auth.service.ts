import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OAuthService } from './oauth.service';
import { SessionService } from './session.service';
import { Context } from '../types/context.types';
import {
  hashPassword,
  verifyPassword,
  generateRandomString,
  generatePermalink,
} from '../utils/crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private oauthService: OAuthService,
    private sessionService: SessionService,
  ) {}

  getGoogleAuthURL() {
    return this.oauthService.getGoogleAuthURL();
  }

  async githubAuth(input: { code: string }, context: Context) {
    const githubUser = await this.oauthService.getGitHubUser(input.code);
    let user = await this.prisma.user.findUnique({
      where: { githubId: String(githubUser.id) },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: githubUser.name || githubUser.login,
          avatar: githubUser.avatar_url,
          email: githubUser.email || user.email,
          permalink: generatePermalink(githubUser.name || githubUser.login),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          githubId: String(githubUser.id),
          name: githubUser.name || githubUser.login,
          email: githubUser.email,
          avatar: githubUser.avatar_url,
          active: true,
          role: 'USER',
          permalink: generatePermalink(githubUser.name || githubUser.login),
          emailVerificationToken: generateRandomString(32),
        },
      });
    }

    const token = await this.sessionService.create({
      ip: context.req.ip,
      userAgent: context.req.headers['user-agent'],
      user,
    });

    context.res.cookie('token', token, {
      maxAge: 3.154e10,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return user;
  }

  async googleAuth(input: { code: string }, context: Context) {
    const googleUser = await this.oauthService.getGoogleUser(input.code);
    let user = await this.prisma.user.findUnique({
      where: { googleId: String(googleUser.id) },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: `${googleUser.given_name} ${googleUser.family_name}`,
          avatar: googleUser.picture,
          email: googleUser.email || user.email,
          permalink: generatePermalink(
            `${googleUser.given_name} ${googleUser.family_name}`,
          ),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          googleId: String(googleUser.id),
          name: `${googleUser.given_name} ${googleUser.family_name}`,
          email: googleUser.email,
          avatar: googleUser.picture,
          active: true,
          role: 'USER',
          permalink: generatePermalink(
            `${googleUser.given_name} ${googleUser.family_name}`,
          ),
          emailVerificationToken: generateRandomString(32),
        },
      });
    }

    const token = await this.sessionService.create({
      ip: context.req.ip,
      userAgent: context.req.headers['user-agent'],
      user,
    });

    context.res.cookie('token', token, {
      maxAge: 3.154e10,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return user;
  }

  async localAuth(email: string, password: string, context: Context) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.password) {
      throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(user.password, password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = await this.sessionService.create({
      ip: context.req.ip,
      userAgent: context.req.headers['user-agent'],
      user,
    });

    context.res.cookie('token', token, {
      maxAge: 3.154e10,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return user;
  }

  async register(input: { email: string; password: string; name: string }) {
    const hashedPassword = await hashPassword(input.password);

    return this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        permalink: generatePermalink(input.name),
        emailVerificationToken: generateRandomString(32),
        active: false,
        role: 'USER',
      },
    });
  }

  async logout(context: Context) {
    context.res.clearCookie('token');
    return null;
  }
}
