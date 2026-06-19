import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { summaryService } from '../services/ai/summary.service';
import { responseService } from '../services/ai/response.service';
import { rootCauseService } from '../services/ai/rootcause.service';
import { escalationService } from '../services/ai/escalation.service';
import { similarService } from '../services/ai/similar.service';
import { copilotService } from '../services/ai/copilot.service';
import { insightsService } from '../services/ai/insights.service';
import { ragService } from '../services/ai/rag.service';
import { embeddingService } from '../services/ai/embedding.service';
import { ticketService } from '../services/ticket.service';

export class AIController {
  async summarize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.findById(req.params.ticketId as string);
      const comments = ticket.comments.map((c: any) => ({
        content: c.content,
        authorName: `${c.author.firstName} ${c.author.lastName}`,
        createdAt: c.createdAt,
      }));
      const summary = await summaryService.summarize(ticket.title, ticket.description, comments);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async generateResponse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.findById(req.params.ticketId as string);
      const comments = ticket.comments.map((c: any) => ({
        content: c.content,
        authorName: `${c.author.firstName} ${c.author.lastName}`,
      }));

      // Get KB context
      let knowledgeContext: string | undefined;
      try {
        const embedding = await embeddingService.generateEmbedding(`${ticket.title} ${ticket.description}`);
        const kbResults = await embeddingService.findSimilarKnowledge(embedding, 3);
        if (kbResults.length > 0) {
          knowledgeContext = kbResults.map((r: any) => r.content).join('\n\n');
        }
      } catch (e) {
        // KB context optional
      }

      const response = await responseService.generateResponse(
        ticket.title,
        ticket.description,
        comments,
        knowledgeContext
      );
      res.json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  }

  async rootCause(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.findById(req.params.ticketId as string);
      const comments = ticket.comments.map((c: any) => ({ content: c.content }));
      const result = await rootCauseService.analyze(
        ticket.title,
        ticket.description,
        ticket.category,
        comments
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async escalation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.findById(req.params.ticketId as string);
      const comments = ticket.comments.map((c: any) => ({ content: c.content }));
      const result = await escalationService.evaluate(
        ticket.title,
        ticket.description,
        ticket.priority,
        ticket.sentiment,
        ticket.urgencyScore,
        ticket.slaDeadline,
        comments
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async similar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.findById(req.params.ticketId as string);
      const result = await similarService.findSimilarResolved(
        ticket.title,
        ticket.description,
        ticket.id
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async copilot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { action, input, context } = req.body;
      const result = await copilotService.execute(action, input, context);
      res.json({ success: true, data: { result } });
    } catch (error) {
      next(error);
    }
  }

  async insights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await insightsService.generateInsights();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async ragQuery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { question } = req.body;
      const result = await ragService.query(question);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
