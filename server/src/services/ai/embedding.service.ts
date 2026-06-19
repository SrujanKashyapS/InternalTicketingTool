import { getAIProvider } from './index';
import prisma from '../../config/database';
import logger from '../../utils/logger';

export class EmbeddingService {
  async generateAndStore(ticketId: string, text: string): Promise<void> {
    try {
      const provider = getAIProvider();
      const embedding = await provider.generateEmbedding(text);
      const vectorStr = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO ticket_embeddings (id, embedding, "ticketId", "createdAt")
         VALUES (gen_random_uuid(), $1::vector, $2, NOW())
         ON CONFLICT ("ticketId") DO UPDATE SET embedding = $1::vector`,
        vectorStr,
        ticketId
      );

      logger.info(`Stored embedding for ticket ${ticketId}`);
    } catch (error) {
      logger.error('Embedding generation/storage failed:', error);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const provider = getAIProvider();
    return provider.generateEmbedding(text);
  }

  async findSimilarTickets(embedding: number[], limit: number = 5, excludeTicketId?: string): Promise<any[]> {
    try {
      const vectorStr = `[${embedding.join(',')}]`;
      
      let query = `
        SELECT te."ticketId", t.title, t.status, t.resolution,
               1 - (te.embedding <=> $1::vector) as similarity
        FROM ticket_embeddings te
        JOIN tickets t ON te."ticketId" = t.id
      `;
      
      const params: any[] = [vectorStr];
      
      if (excludeTicketId) {
        query += ` WHERE te."ticketId" != $2`;
        params.push(excludeTicketId);
      }
      
      query += ` ORDER BY te.embedding <=> $1::vector LIMIT $${params.length + 1}`;
      params.push(limit);

      const results = await prisma.$queryRawUnsafe(query, ...params) as any[];
      return results.map((r: any) => ({
        ticketId: r.ticketId,
        title: r.title,
        status: r.status,
        resolution: r.resolution,
        similarity: Math.round(parseFloat(r.similarity) * 100) / 100,
      }));
    } catch (error) {
      logger.error('Similar ticket search failed:', error);
      return [];
    }
  }

  async findSimilarKnowledge(embedding: number[], limit: number = 5): Promise<any[]> {
    try {
      const vectorStr = `[${embedding.join(',')}]`;
      
      const results = await prisma.$queryRawUnsafe(
        `SELECT kc.id, kc.content, kc."chunkIndex", kd.title as "documentTitle",
                1 - (kc.embedding <=> $1::vector) as similarity
         FROM knowledge_chunks kc
         JOIN knowledge_documents kd ON kc."documentId" = kd.id
         WHERE kc.embedding IS NOT NULL
         ORDER BY kc.embedding <=> $1::vector
         LIMIT $2`,
        vectorStr,
        limit
      ) as any[];

      return results.map((r: any) => ({
        id: r.id,
        content: r.content,
        chunkIndex: r.chunkIndex,
        documentTitle: r.documentTitle,
        similarity: Math.round(parseFloat(r.similarity) * 100) / 100,
      }));
    } catch (error) {
      logger.error('Similar knowledge search failed:', error);
      return [];
    }
  }
}

export const embeddingService = new EmbeddingService();
