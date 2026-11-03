// WebLLM Integration - Run actual language models in the browser
import * as webllm from "@mlc-ai/web-llm";

export interface WebLLMConfig {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class WebLLMEngine {
  private engine: webllm.MLCEngineInterface | null = null;
  private config: WebLLMConfig;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config?: Partial<WebLLMConfig>) {
    this.config = {
      modelId: config?.modelId || "Phi-3-mini-4k-instruct-q4f16_1-MLC",
      temperature: config?.temperature || 0.7,
      maxTokens: config?.maxTokens || 2048,
      topP: config?.topP || 0.9,
    };
    console.log('[WebLLMEngine] Language model engine created');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('[WebLLMEngine] Initializing model:', this.config.modelId);
        
        this.engine = await webllm.CreateMLCEngine(
          this.config.modelId,
          {
            initProgressCallback: (progress: { text: string }) => {
              console.log('[WebLLMEngine] Loading:', progress.text);
            }
          }
        );

        this.isInitialized = true;
        console.log('[WebLLMEngine] Model initialized successfully');
      } catch (error) {
        console.error('[WebLLMEngine] Initialization failed:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  async generate(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }

    try {
      const messages: webllm.ChatCompletionMessageParam[] = [];

      // Add system prompt if provided
      if (options?.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt
        });
      }

      // Add user prompt
      messages.push({
        role: "user",
        content: prompt
      });

      const completion = await this.engine.chat.completions.create({
        messages,
        temperature: options?.temperature || this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        top_p: this.config.topP,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('[WebLLMEngine] Generation failed:', error);
      throw error;
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }

    try {
      const completion = await this.engine.chat.completions.create({
        messages: messages as webllm.ChatCompletionMessageParam[],
        temperature: options?.temperature || this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        top_p: this.config.topP,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('[WebLLMEngine] Chat failed:', error);
      throw error;
    }
  }

  async reason(
    question: string,
    context?: string
  ): Promise<{
    answer: string;
    reasoning: string;
    confidence: number;
  }> {
    const systemPrompt = `You are a reasoning assistant. Think step by step.
First, analyze the question carefully.
Then, break down your reasoning process.
Finally, provide a clear answer with your confidence level (0-100%).

Format your response as:
REASONING: [your step-by-step reasoning]
ANSWER: [your final answer]
CONFIDENCE: [your confidence percentage]`;

    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}`
      : `Question: ${question}`;

    const response = await this.generate(prompt, {
      systemPrompt,
      temperature: 0.3, // Lower temperature for reasoning
      maxTokens: 1024
    });

    // Parse the response
    const reasoningMatch = response.match(/REASONING:\s*([\s\S]*?)(?=ANSWER:|$)/);
    const answerMatch = response.match(/ANSWER:\s*([\s\S]*?)(?=CONFIDENCE:|$)/);
    const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);

    return {
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : response,
      answer: answerMatch ? answerMatch[1].trim() : response,
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.7
    };
  }

  async create(
    task: string,
    style: string = 'creative',
    constraints?: string[]
  ): Promise<string> {
    const stylePrompts: Record<string, string> = {
      creative: 'Be creative, original, and engaging. Use vivid language and unique perspectives.',
      technical: 'Be precise, accurate, and detailed. Use proper terminology and structure.',
      conversational: 'Be natural, friendly, and engaging. Write like you\'re talking to a friend.',
      formal: 'Be professional, polished, and appropriate. Use proper grammar and structure.',
      persuasive: 'Be compelling, logical, and convincing. Use rhetoric and evidence.',
    };

    const systemPrompt = `You are a ${style} writing assistant. ${stylePrompts[style] || stylePrompts.creative}
${constraints ? `\nConstraints: ${constraints.join(', ')}` : ''}
Generate high-quality content that meets these requirements.`;

    return await this.generate(task, {
      systemPrompt,
      temperature: style === 'creative' ? 0.9 : 0.7,
      maxTokens: 2048
    });
  }

  async analyze(
    text: string,
    analysisType: 'sentiment' | 'entities' | 'intent' | 'nuance' | 'summary'
  ): Promise<any> {
    const analysisPrompts: Record<string, string> = {
      sentiment: `Analyze the sentiment of this text. Identify the overall emotional tone (positive, negative, neutral, mixed) and any specific emotions expressed. Rate confidence 0-100%.
      
Format:
SENTIMENT: [positive/negative/neutral/mixed]
EMOTIONS: [list of specific emotions]
CONFIDENCE: [percentage]
EXPLANATION: [brief explanation]`,

      entities: `Extract all entities from this text (people, organizations, locations, dates, etc.). For each entity, identify its type and role.

Format:
ENTITIES:
- [Entity]: [Type] - [Role/Context]
CONFIDENCE: [percentage]`,

      intent: `Determine the primary intent of this text. What is the author trying to achieve? Identify the main goal and any secondary intentions.

Format:
PRIMARY_INTENT: [main goal]
SECONDARY_INTENTS: [list of secondary goals]
CONFIDENCE: [percentage]
EXPLANATION: [brief explanation]`,

      nuance: `Analyze the nuances in this text. Identify sarcasm, irony, implicit meanings, cultural references, and subtle implications that aren't explicitly stated.

Format:
NUANCES:
- [Nuance]: [Explanation]
SUBTEXT: [What's implied but not said]
CONFIDENCE: [percentage]`,

      summary: `Create a concise summary of this text. Capture the main points, key arguments, and essential information in 2-3 sentences.

Format:
SUMMARY: [2-3 sentence summary]
KEY_POINTS:
- [Point 1]
- [Point 2]
- [Point 3]
CONFIDENCE: [percentage]`,
    };

    const response = await this.generate(text, {
      systemPrompt: analysisPrompts[analysisType],
      temperature: 0.3,
      maxTokens: 1024
    });

    return response;
  }

  async improve(
    text: string,
    improvementType: 'clarity' | 'conciseness' | 'engagement' | 'formality' | 'creativity'
  ): Promise<string> {
    const improvementPrompts: Record<string, string> = {
      clarity: 'Improve this text for clarity. Make it easier to understand while preserving the meaning.',
      conciseness: 'Make this text more concise. Remove redundancy while keeping all important information.',
      engagement: 'Make this text more engaging and interesting to read.',
      formality: 'Adjust the formality level to be more professional and polished.',
      creativity: 'Enhance the creativity and originality of this text.',
    };

    const prompt = `Original text:
${text}

Task: ${improvementPrompts[improvementType]}

Provide the improved version:`;

    return await this.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2048
    });
  }

  getStats() {
    return {
      isInitialized: this.isInitialized,
      modelId: this.config.modelId,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    };
  }
}
