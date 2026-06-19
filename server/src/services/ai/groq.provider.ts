import Groq from 'groq-sdk';
import { AIProvider } from './provider.interface';
import { config } from '../../config';
import logger from '../../utils/logger';

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: config.ai.groqApiKey });
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.3,
        max_tokens: 4096,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Groq generateText error:', error);
      throw new Error('AI generation failed');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Groq doesn't have native embedding support, so we generate a deterministic
    // hash-based embedding vector for similarity comparison
    try {
      const embedding = new Array(3072).fill(0);
      const normalized = text.toLowerCase().trim();
      
      // Use a simple hash-based approach for embedding approximation
      for (let i = 0; i < normalized.length; i++) {
        const charCode = normalized.charCodeAt(i);
        const idx = (charCode * (i + 1) * 31) % 3072;
        embedding[idx] += Math.sin(charCode * (i + 1)) * 0.1;
      }

      // Normalize the vector
      const magnitude = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0)) || 1;
      return embedding.map((val: number) => val / magnitude);
    } catch (error) {
      logger.error('Groq embedding error:', error);
      throw new Error('Embedding generation failed');
    }
  }

  async generateJSON<T = any>(prompt: string, systemPrompt?: string): Promise<T> {
    try {
      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ 
        role: 'user', 
        content: `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation.` 
      });

      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(text) as T;
    } catch (error) {
      logger.error('Groq generateJSON error:', error);
      throw new Error('AI JSON generation failed');
    }
  }
}
