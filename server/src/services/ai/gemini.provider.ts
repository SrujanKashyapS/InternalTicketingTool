import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider } from './provider.interface';
import { config } from '../../config';
import logger from '../../utils/logger';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private embeddingModel: GenerativeModel;

  constructor() {
    this.client = new GoogleGenerativeAI(config.ai.geminiApiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.embeddingModel = this.client.getGenerativeModel({ model: 'gemini-embedding-001' });
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini generateText error:', error);
      throw new Error('AI generation failed');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      logger.error('Gemini embedding error:', error);
      throw new Error('Embedding generation failed');
    }
  }

  async generateJSON<T = any>(prompt: string, systemPrompt?: string): Promise<T> {
    try {
      const jsonPrompt = `${systemPrompt || ''}\n\n${prompt}\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation.`;
      const result = await this.model.generateContent(jsonPrompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      logger.error('Gemini generateJSON error:', error);
      throw new Error('AI JSON generation failed');
    }
  }
}
