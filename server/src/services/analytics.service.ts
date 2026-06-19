import prisma from '../config/database';

export class AnalyticsService {
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      criticalTickets,
      last30DaysTickets,
      last7DaysTickets,
      ticketsByCategory,
      ticketsByPriority,
      recentTickets,
      avgResolutionTime,
      slaBreached,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } }),
      prisma.ticket.count({ where: { priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.ticket.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.ticket.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      prisma.ticket.groupBy({
        by: ['priority'],
        _count: { _all: true },
      }),
      prisma.ticket.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { firstName: true, lastName: true } },
          assignedAgent: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.ticket.aggregate({
        where: { resolvedAt: { not: null } },
        _avg: { urgencyScore: true },
      }),
      prisma.ticket.count({
        where: {
          slaDeadline: { lt: now },
          status: { notIn: ['RESOLVED', 'CLOSED'] },
        },
      }),
    ]);

    // Calculate resolution time distribution
    const resolvedWithTime = await prisma.ticket.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 100,
      orderBy: { resolvedAt: 'desc' },
    });

    const resolutionTimes = resolvedWithTime.map(t => {
      const diff = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
      return Math.round(diff * 10) / 10;
    });

    const avgResTime = resolutionTimes.length > 0
      ? Math.round((resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) * 10) / 10
      : 0;

    // Ticket volume by day (last 30 days)
    const ticketsByDay = await prisma.$queryRawUnsafe(`
      SELECT DATE(\"createdAt\") as date, COUNT(*)::int as count
      FROM tickets
      WHERE \"createdAt\" >= $1
      GROUP BY DATE(\"createdAt\")
      ORDER BY date ASC
    `, thirtyDaysAgo) as any[];

    // Agent performance
    const agentPerformance = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedTickets: {
          select: { status: true, createdAt: true, resolvedAt: true },
        },
      },
    });

    const agentStats = agentPerformance.map(agent => {
      const total = agent.assignedTickets.length;
      const resolved = agent.assignedTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const active = total - resolved;
      const resolvedTimes = agent.assignedTickets
        .filter(t => t.resolvedAt)
        .map(t => (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60));
      const avgRes = resolvedTimes.length > 0
        ? Math.round((resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length) * 10) / 10
        : 0;

      return {
        id: agent.id,
        name: `${agent.firstName} ${agent.lastName}`,
        total,
        resolved,
        active,
        avgResolutionHours: avgRes,
      };
    });

    return {
      overview: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        criticalTickets,
        last30DaysTickets,
        last7DaysTickets,
        avgResolutionHours: avgResTime,
        slaBreached,
        slaCompliance: totalTickets > 0
          ? Math.round(((totalTickets - slaBreached) / totalTickets) * 100)
          : 100,
      },
      ticketsByCategory: ticketsByCategory.map(c => ({
        category: c.category,
        count: c._count._all,
      })),
      ticketsByPriority: ticketsByPriority.map(p => ({
        priority: p.priority,
        count: p._count._all,
      })),
      ticketsByDay,
      agentPerformance: agentStats,
      recentTickets,
    };
  }

  async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
