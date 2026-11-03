// Conversational Response Generator - reasons about what to say
export class ConversationalResponder {
  private conversationContext: Map<string, any> = new Map();
  
  constructor() {
    console.log('[ConversationalResponder] Initialized with reasoning capabilities');
  }

  // Generate a natural conversational response
  async generateResponse(
    input: string,
    context: {
      intent: string;
      emotion: string;
      entities: string[];
      conversationHistory: string[];
    }
  ): Promise<string> {
    const lower = input.toLowerCase().trim();
    
    // Detect conversational intents
    if (this.isGreeting(lower)) {
      return this.generateGreeting(input, context);
    }
    
    if (this.isFarewell(lower)) {
      return this.generateFarewell(input, context);
    }
    
    if (this.isSmallTalk(lower)) {
      return this.generateSmallTalk(input, context);
    }
    
    if (this.isThanks(lower)) {
      return this.generateThanks(input, context);
    }
    
    if (this.isQuestion(lower)) {
      return this.generateQuestionResponse(input, context);
    }
    
    if (this.isOpinion(lower)) {
      return this.generateOpinionResponse(input, context);
    }
    
    if (this.isRequest(lower)) {
      return this.generateRequestResponse(input, context);
    }
    
    // Default: acknowledge and engage
    return this.generateEngagement(input, context);
  }

  // Detect greetings
  private isGreeting(input: string): boolean {
    const greetings = [
      'hi', 'hello', 'hey', 'yo', 'sup', 'what\'s up', 'whats up',
      'good morning', 'good afternoon', 'good evening', 'howdy',
      'greetings', 'hola', 'heya', 'hiya', 'wassup', 'wazzup'
    ];
    
    return greetings.some(g => input.startsWith(g) || input === g);
  }

  // Detect farewells
  private isFarewell(input: string): boolean {
    const farewells = [
      'bye', 'goodbye', 'see ya', 'see you', 'later', 'take care',
      'good night', 'gotta go', 'peace', 'catch you later', 'ttyl'
    ];
    
    return farewells.some(f => input.includes(f));
  }

  // Detect small talk
  private isSmallTalk(input: string): boolean {
    const smallTalk = [
      'how are you', 'how\'s it going', 'how you doing', 'what\'s new',
      'whats new', 'how\'s your day', 'how was your day', 'nice weather',
      'how\'s everything', 'what\'s going on', 'whats going on'
    ];
    
    return smallTalk.some(s => input.includes(s));
  }

  // Detect thanks
  private isThanks(input: string): boolean {
    const thanks = ['thanks', 'thank you', 'thx', 'ty', 'appreciate it', 'cheers'];
    return thanks.some(t => input.includes(t));
  }

  // Detect questions
  private isQuestion(input: string): boolean {
    return input.endsWith('?') || 
           input.startsWith('what') ||
           input.startsWith('how') ||
           input.startsWith('why') ||
           input.startsWith('when') ||
           input.startsWith('where') ||
           input.startsWith('who') ||
           input.startsWith('which');
  }

  // Detect opinions
  private isOpinion(input: string): boolean {
    const opinionWords = ['think', 'believe', 'feel', 'opinion', 'should', 'would', 'better', 'worse'];
    return opinionWords.some(w => input.includes(w));
  }

  // Detect requests
  private isRequest(input: string): boolean {
    const requestWords = ['can you', 'could you', 'please', 'help me', 'i need', 'i want'];
    return requestWords.some(w => input.includes(w));
  }

  // Generate greeting response
  private generateGreeting(input: string, context: any): string {
    const timeOfDay = this.getTimeOfDay();
    const emotion = context.emotion || 'neutral';
    
    // Vary responses based on context
    const responses = {
      casual: [
        `Hey there! ${timeOfDay} How can I help you today?`,
        `Hi! What's on your mind?`,
        `Hello! Ready to dive into something interesting?`,
        `Hey! What can I do for you?`
      ],
      friendly: [
        `Hello! Great to chat with you. What's up?`,
        `Hi there! How's your day going?`,
        `Hey! Good to see you. What can I help with?`,
        `Hello! What interesting things shall we explore today?`
      ],
      enthusiastic: [
        `Hey! Excited to help you out! What's the plan?`,
        `Hi there! Ready for some awesome problem-solving?`,
        `Hello! Let's make something great today!`,
        `Hey! What amazing thing are we working on?`
      ]
    };
    
    const style = emotion === 'excited' ? 'enthusiastic' : 
                  emotion === 'happy' ? 'friendly' : 'casual';
    
    const options = responses[style];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Generate farewell response
  private generateFarewell(input: string, context: any): string {
    const responses = [
      'Goodbye! Feel free to come back anytime you need help.',
      'See you later! Have a great day!',
      'Take care! I\'ll be here when you need me.',
      'Bye! It was great chatting with you.',
      'Later! Don\'t hesitate to reach out anytime.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate small talk response
  private generateSmallTalk(input: string, context: any): string {
    const responses = [
      'I\'m doing great, thanks for asking! I\'m here and ready to help with whatever you need. What\'s on your mind?',
      'Everything\'s good on my end! I\'m all set to assist you. What would you like to work on?',
      'I\'m functioning perfectly! Ready to dive into any topic you\'re interested in. What\'s up?',
      'All systems go! I\'m here to help with coding, research, creative writing, or just chatting. What interests you?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate thanks response
  private generateThanks(input: string, context: any): string {
    const responses = [
      'You\'re welcome! Happy to help. Let me know if there\'s anything else you need.',
      'Anytime! That\'s what I\'m here for. Need anything else?',
      'Glad I could help! Feel free to ask if you have more questions.',
      'My pleasure! Don\'t hesitate to reach out if you need anything else.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate question response
  private generateQuestionResponse(input: string, context: any): string {
    // This will be handled by the knowledge base, but we can add context
    const entities = context.entities || [];
    
    if (entities.length > 0) {
      return `That's an interesting question about ${entities.join(', ')}. Let me look that up for you...`;
    }
    
    return `Great question! Let me find the answer for you...`;
  }

  // Generate opinion response
  private generateOpinionResponse(input: string, context: any): string {
    const responses = [
      'That\'s an interesting perspective. Let me think about that...',
      'I see what you\'re getting at. Here\'s my take on it...',
      'Good point. Let me share some thoughts on that...',
      'Interesting viewpoint. Here\'s how I see it...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate request response
  private generateRequestResponse(input: string, context: any): string {
    const responses = [
      'Sure, I can help with that! Let me work on it...',
      'Absolutely! Here\'s what I can do for you...',
      'Of course! Let me take care of that...',
      'Happy to help! Here we go...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate engagement response (default)
  private generateEngagement(input: string, context: any): string {
    const responses = [
      `I hear you. Tell me more about what you're thinking.`,
      `Interesting! What would you like to explore further?`,
      `Got it. How can I help you with that?`,
      `I'm listening. What's on your mind?`,
      `That's worth discussing. What aspect interests you most?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Helper to get time of day
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // Convert tool results to natural language
  convertToolResultToNaturalLanguage(toolResult: any, originalQuery: string): string {
    // If it's a search result
    if (toolResult.results && Array.isArray(toolResult.results)) {
      if (toolResult.results.length === 0) {
        return `I searched for information about "${originalQuery}" but didn't find specific results. Could you rephrase your question or provide more context?`;
      }
      
      let response = `Here's what I found about "${originalQuery}":\n\n`;
      
      toolResult.results.slice(0, 3).forEach((result: any, index: number) => {
        response += `${index + 1}. **${result.name || result.title}**`;
        if (result.snippet) {
          response += ` - ${result.snippet}`;
        }
        if (result.url) {
          response += ` [Source](${result.url})`;
        }
        response += '\n';
      });
      
      return response;
    }
    
    // If it's a knowledge answer
    if (toolResult.answer) {
      return toolResult.answer;
    }
    
    // If it's raw JSON, format it nicely
    if (typeof toolResult === 'object') {
      return `Here's the information:\n\n${JSON.stringify(toolResult, null, 2)}`;
    }
    
    // Default: return as string
    return String(toolResult);
  }

  getStats() {
    return {
      responseTypes: ['greeting', 'farewell', 'smallTalk', 'thanks', 'question', 'opinion', 'request', 'engagement'],
      totalResponses: 0
    };
  }
}
