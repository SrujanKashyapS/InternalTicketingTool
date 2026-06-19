import { embeddingService } from './embedding.service';
import { DuplicateResult } from './provider.interface';
import logger from '../../utils/logger';

export class DuplicateService {
  async findDuplicates(title: string, description: string, excludeTicketId?: string): Promise<DuplicateResult[]> {
    try {
      const text = `${title} ${description}`;
      const embedding = await embeddingService.generateEmbedding(text);
      const similar = await embeddingService.findSimilarTickets(embedding, 5, excludeTicketId);

      return similar
        .filter((s: any) => s.similarity > 0.7)
        .map((s: any) => ({
          ticketId: s.ticketId,
          title: s.title,
          similarity: s.similarity,
          status: s.status,
        }));
    } catch (error) {
      logger.error('Duplicate detection failed:', error);
      return [];
    }
  }
}

export const duplicateService = new DuplicateService();
