import prisma from '../config/database';

export class SearchService {
  async globalSearch(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [tickets, users, documents] = await Promise.all([
      prisma.ticket.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      }),
      prisma.knowledgeDocument.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      tickets: tickets.map(t => ({ ...t, type: 'ticket' as const })),
      users: users.map(u => ({ ...u, type: 'user' as const })),
      documents: documents.map(d => ({ ...d, type: 'document' as const })),
      totalResults: tickets.length + users.length + documents.length,
    };
  }
}

export const searchService = new SearchService();
