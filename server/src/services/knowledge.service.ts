import prisma from '../config/database';
import { ragService } from './ai/rag.service';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export class KnowledgeService {
  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { chunks: true } } },
      }),
      prisma.knowledgeDocument.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          select: { id: true, content: true, chunkIndex: true, createdAt: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Knowledge document');
    }

    return document;
  }

  async create(data: {
    title: string;
    description?: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    publicId?: string;
    content: string;
  }) {
    const document = await prisma.knowledgeDocument.create({
      data: {
        title: data.title,
        description: data.description,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        publicId: data.publicId,
        status: 'processing',
      },
    });

    // Process document asynchronously
    ragService.processDocument(document.id, data.content).catch(
      (err) => logger.error('Document processing failed:', err)
    );

    return document;
  }

  async delete(id: string) {
    const document = await prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundError('Knowledge document');
    }

    await prisma.knowledgeDocument.delete({ where: { id } });
  }

  async reindex(id: string) {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id },
      include: { chunks: true },
    });

    if (!document) {
      throw new NotFoundError('Knowledge document');
    }

    // Delete existing chunks
    await prisma.knowledgeChunk.deleteMany({ where: { documentId: id } });

    // Update status
    await prisma.knowledgeDocument.update({
      where: { id },
      data: { status: 'processing', chunkCount: 0 },
    });

    // Get content from chunks or refetch
    const content = document.chunks.map(c => c.content).join(' ');
    if (content) {
      ragService.processDocument(id, content).catch(
        (err) => logger.error('Re-indexing failed:', err)
      );
    }

    return { message: 'Re-indexing started' };
  }

  async query(question: string) {
    return ragService.query(question);
  }
}

export const knowledgeService = new KnowledgeService();
