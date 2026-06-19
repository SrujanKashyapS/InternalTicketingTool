import prisma from '../config/database';

export class UserService {
  async findAll(page: number = 1, limit: number = 20, search?: string, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          department: true,
          isActive: true,
          createdAt: true,
          _count: { select: { createdTickets: true, assignedTickets: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: { role?: string; isActive?: boolean; department?: string }) {
    return prisma.user.update({
      where: { id },
      data: data as any,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        department: true,
        isActive: true,
      },
    });
  }

  async getAgents() {
    return prisma.user.findMany({
      where: { role: 'AGENT', isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        _count: { select: { assignedTickets: true } },
      },
      orderBy: { firstName: 'asc' },
    });
  }
}

export const userService = new UserService();
