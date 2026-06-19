import { getAIProvider } from './index';
import { embeddingService } from './embedding.service';
import { RAGResult } from './provider.interface';
import logger from '../../utils/logger';

export class RAGService {
  async query(question: string): Promise<RAGResult> {
    try {
      const provider = getAIProvider();
      const embedding = await provider.generateEmbedding(question);
      const relevantChunks = await embeddingService.findSimilarKnowledge(embedding, 5);

      if (relevantChunks.length === 0) {
        return {
          answer: 'No relevant information found in the knowledge base for this query.',
          sources: [],
          confidence: 0,
        };
      }

      const contextParts = relevantChunks.map(
        (chunk: any, i: number) => `[Source ${i + 1}: ${chunk.documentTitle}]\n${chunk.content}`
      );
      const context = contextParts.join('\n\n---\n\n');

      const prompt = `Answer the following question using ONLY the provided context. If the context doesn't contain enough information, say so.

Question: ${question}

Context:
${context}

Provide a comprehensive answer with citations to the source documents.`;

      const systemPrompt = 'You are a knowledge base assistant. Answer questions accurately based on provided context. Always cite your sources.';

      const answer = await provider.generateText(prompt, systemPrompt);

      const sources = relevantChunks.map((chunk: any) => ({
        documentTitle: chunk.documentTitle,
        chunkContent: chunk.content.substring(0, 200) + '...',
        confidence: chunk.similarity,
      }));

      const avgConfidence = sources.reduce((sum: number, s: any) => sum + s.confidence, 0) / sources.length;

      return {
        answer,
        sources,
        confidence: Math.round(avgConfidence * 100) / 100,
      };
    } catch (error) {
      logger.error('RAG query failed:', error);
      return {
        answer: 'Unable to process the query at this time.',
        sources: [],
        confidence: 0,
      };
    }
  }

  async processDocument(documentId: string, content: string): Promise<number> {
    try {
      const provider = getAIProvider();
      const chunks = this.chunkText(content, 500, 50);

      let storedChunks = 0;
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await provider.generateEmbedding(chunks[i]);
        const vectorStr = `[${embedding.join(',')}]`;

        await (await import('../../config/database')).default.$executeRawUnsafe(
          `INSERT INTO knowledge_chunks (id, content, "chunkIndex", embedding, "documentId", "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3::vector, $4, NOW())`,
          chunks[i],
          i,
          vectorStr,
          documentId
        );
        storedChunks++;
      }

      await (await import('../../config/database')).default.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'processed', chunkCount: storedChunks },
      });

      logger.info(`Processed document ${documentId}: ${storedChunks} chunks`);
      return storedChunks;
    } catch (error) {
      logger.error('Document processing failed:', error);
      await (await import('../../config/database')).default.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'failed' },
      });
      throw error;
    }
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }
}

export const ragService = new RAGService();
