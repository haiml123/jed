import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    // For demo: also accept plain text match
    if (!valid && password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Track last login for the weekly engagement formula (20% weight on logins)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        school: user.school,
      },
    };
  }

  async register(email: string, password: string, name: string, role: string = 'TEACHER') {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new UnauthorizedException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name, role: role as any },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        school: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
