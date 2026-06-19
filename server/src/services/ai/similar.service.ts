import { embeddingService } from './embedding.service';
import { SimilarTicketResult } from './provider.interface';
import logger from '../../utils/logger';

export class SimilarService {
  async findSimilarResolved(title: string, description: string, ticketId?: string): Promise<SimilarTicketResult[]> {
    try {
      const text = `${title} ${description}`;
      const embedding = await embeddingService.generateEmbedding(text);
      const similar = await embeddingService.findSimilarTickets(embedding, 10, ticketId);

      return similar
        .filter((s: any) => s.status === 'RESOLVED' || s.status === 'CLOSED')
        .slice(0, 5)
        .map((s: any) => ({
          ticketId: s.ticketId,
          title: s.title,
          summary: s.title,
          resolution: s.resolution || 'Resolution not documented',
          similarity: s.similarity,
        }));
    } catch (error) {
      logger.error('Similar resolved tickets search failed:', error);
      return [];
    }
  }
}

export const similarService = new SimilarService();
