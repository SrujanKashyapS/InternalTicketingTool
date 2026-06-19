import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ticketService } from '../services/ticket.service';
import { createTicketSchema, updateTicketSchema, ticketQuerySchema } from '../validators/ticket.validator';
import { uploadService } from '../services/upload.service';
import prisma from '../config/database';

export class TicketController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createTicketSchema.parse(req.body);
      const result = await ticketService.create(data, req.user!.userId);

      // Handle file uploads
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const uploaded = await uploadService.uploadFile(file.buffer, 'tickets');
          await prisma.attachment.create({
            data: {
              filename: file.originalname,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              url: uploaded.url,
              publicId: uploaded.publicId,
              ticketId: result.ticket.id,
            },
          });
        }
      }

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async checkDuplicates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const duplicates = await ticketService.checkDuplicates(title, description);
      res.json({ success: true, data: { duplicates } });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = ticketQuerySchema.parse(req.query);
      const result = await ticketService.findAll(query, req.user!.userId, req.user!.role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.findById(req.params.id as string);
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateTicketSchema.parse(req.body);
      const ticket = await ticketService.update(req.params.id as string, data, req.user!.userId);
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ticketService.delete(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: 'Ticket deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ticketService.getStats(req.user!.userId, req.user!.role);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file provided' });
      }

      const uploaded = await uploadService.uploadFile(req.file.buffer, 'tickets');
      const attachment = await prisma.attachment.create({
        data: {
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: uploaded.url,
          publicId: uploaded.publicId,
          ticketId: req.params.id as string,
        },
      });

      res.status(201).json({ success: true, data: attachment });
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
