import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { knowledgeService } from '../services/knowledge.service';
import { uploadService } from '../services/upload.service';
import logger from '../utils/logger';

export class KnowledgeController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await knowledgeService.findAll(page, limit, search);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const document = await knowledgeService.findById(req.params.id as string);
      res.json({ success: true, data: document });
    } catch (error) {
      next(error);
    }
  }

  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file provided' });
      }

      const { title, description } = req.body;
      
      // Extract text content based on file type
      let content = '';
      if (req.file.mimetype === 'text/plain') {
        content = req.file.buffer.toString('utf-8');
      } else if (req.file.mimetype === 'application/pdf') {
        try {
          // @ts-ignore
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(req.file.buffer);
          content = pdfData.text;
        } catch (e) {
          content = `PDF document: ${title}. Content extraction pending.`;
        }
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          content = result.value;
        } catch (e) {
          content = `DOCX document: ${title}. Content extraction pending.`;
        }
      } else {
        content = req.file.buffer.toString('utf-8');
      }

      // Upload to storage
      const uploaded = await uploadService.uploadFile(req.file.buffer, 'knowledge');

      const document = await knowledgeService.create({
        title,
        description,
        filename: req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: uploaded.url,
        publicId: uploaded.publicId,
        content,
      });

      res.status(201).json({ success: true, data: document });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await knowledgeService.delete(req.params.id as string);
      res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
      next(error);
    }
  }

  async reindex(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await knowledgeService.reindex(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async query(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ success: false, error: 'Question is required' });
      }
      const result = await knowledgeService.query(question);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const knowledgeController = new KnowledgeController();
