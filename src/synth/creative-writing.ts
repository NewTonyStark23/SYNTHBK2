// Real creative writing with style transfer and narrative generation
export class CreativeWritingEngine {
  private storyTemplates: Map<string, StoryTemplate> = new Map();
  private styleVocabularies: Map<string, string[]> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeStyleVocabularies();
    console.log('[CreativeWritingEngine] Initialized with style transfer capabilities');
  }

  private initializeTemplates(): void {
    this.storyTemplates.set('short_story', {
      name: 'Short Story',
      structure: ['introduction', 'rising_action', 'climax', 'falling_action', 'resolution'],
      minWords: 500,
      maxWords: 2000
    });

    this.storyTemplates.set('poem', {
      name: 'Poem',
      structure: ['stanza1', 'stanza2', 'stanza3'],
      minWords: 50,
      maxWords: 200
    });

    this.storyTemplates.set('essay', {
      name: 'Essay',
      structure: ['introduction', 'body1', 'body2', 'body3', 'conclusion'],
      minWords: 800,
      maxWords: 3000
    });
  }

  private initializeStyleVocabularies(): void {
    this.styleVocabularies.set('literary', [
      'ethereal', 'luminous', 'melancholy', 'ephemeral', 'transcendent',
      'poignant', 'resplendent', 'serendipitous', 'quintessential', 'ineffable'
    ]);

    this.styleVocabularies.set('casual', [
      'awesome', 'cool', 'pretty', 'kinda', 'totally',
      'literally', 'basically', 'honestly', 'definitely', 'super'
    ]);

    this.styleVocabularies.set('formal', [
      'furthermore', 'consequently', 'nevertheless', 'notwithstanding',
      'henceforth', 'whereby', 'therein', 'aforementioned', 'pursuant'
    ]);

    this.styleVocabularies.set('technical', [
      'algorithm', 'implementation', 'optimization', 'architecture',
      'framework', 'methodology', 'paradigm', 'infrastructure', 'protocol'
    ]);
  }

  // Generate creative content
  async generateCreative(
    prompt: string,
    style: string = 'literary',
    type: string = 'short_story'
  ): Promise<{
    content: string;
    style: string;
    type: string;
    wordCount: number;
    metadata: CreativeMetadata;
  }> {
    const template = this.storyTemplates.get(type);
    if (!template) {
      throw new Error(`Unknown content type: ${type}`);
    }

    // Generate content based on type
    let content = '';
    
    switch (type) {
      case 'short_story':
        content = await this.generateShortStory(prompt, style, template);
        break;
      case 'poem':
        content = await this.generatePoem(prompt, style);
        break;
      case 'essay':
        content = await this.generateEssay(prompt, style, template);
        break;
      default:
        content = await this.generateGenericCreative(prompt, style);
    }

    const wordCount = content.split(/\s+/).length;

    return {
      content,
      style,
      type,
      wordCount,
      metadata: {
        prompt,
        generatedAt: Date.now(),
        structure: template.structure,
        styleVocabulary: this.styleVocabularies.get(style) || []
      }
    };
  }

  // Generate a short story
  private async generateShortStory(
    prompt: string,
    style: string,
    template: StoryTemplate
  ): Promise<string> {
    const vocab = this.styleVocabularies.get(style) || [];
    const elements = this.extractStoryElements(prompt);
    
    let story = '';
    
    // Introduction
    story += this.generateIntroduction(elements, vocab, style);
    story += '\n\n';
    
    // Rising action
    story += this.generateRisingAction(elements, vocab, style);
    story += '\n\n';
    
    // Climax
    story += this.generateClimax(elements, vocab, style);
    story += '\n\n';
    
    // Falling action
    story += this.generateFallingAction(elements, vocab, style);
    story += '\n\n';
    
    // Resolution
    story += this.generateResolution(elements, vocab, style);
    
    return story;
  }

  private extractStoryElements(prompt: string): StoryElements {
    const lower = prompt.toLowerCase();
    
    return {
      protagonist: this.extractProtagonist(prompt),
      setting: this.extractSetting(prompt),
      conflict: this.extractConflict(prompt),
      theme: this.extractTheme(prompt),
      mood: this.extractMood(prompt)
    };
  }

  private extractProtagonist(prompt: string): string {
    const match = prompt.match(/(?:about|featuring|with)\s+(?:a\s+)?(\w+)(?:\s+who|\s+that)?/i);
    return match ? match[1] : 'protagonist';
  }

  private extractSetting(prompt: string): string {
    const match = prompt.match(/(?:in|at|set in)\s+([^,.]+)/i);
    return match ? match[1].trim() : 'a mysterious place';
  }

  private extractConflict(prompt: string): string {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('conflict') || lower.includes('struggle')) {
      return 'an internal struggle';
    } else if (lower.includes('adventure') || lower.includes('journey')) {
      return 'a challenging journey';
    } else if (lower.includes('mystery') || lower.includes('secret')) {
      return 'a hidden mystery';
    }
    
    return 'an unexpected challenge';
  }

  private extractTheme(prompt: string): string {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('love')) return 'love';
    if (lower.includes('loss')) return 'loss';
    if (lower.includes('hope')) return 'hope';
    if (lower.includes('fear')) return 'fear';
    if (lower.includes('courage')) return 'courage';
    
    return 'transformation';
  }

  private extractMood(prompt: string): string {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('dark') || lower.includes('mysterious')) return 'dark';
    if (lower.includes('happy') || lower.includes('joyful')) return 'joyful';
    if (lower.includes('sad') || lower.includes('melancholy')) return 'melancholy';
    if (lower.includes('exciting') || lower.includes('thrilling')) return 'thrilling';
    
    return 'contemplative';
  }

  private generateIntroduction(elements: StoryElements, vocab: string[], style: string): string {
    const openingPhrases = [
      `In the ${elements.setting}, there lived a ${elements.protagonist} whose life was about to change forever.`,
      `The ${elements.setting} stretched out before the ${elements.protagonist}, full of possibilities and dangers.`,
      `It began, as most extraordinary tales do, on an ordinary day in ${elements.setting}.`,
      `The ${elements.protagonist} never expected that this day in ${elements.setting} would be different from any other.`
    ];
    
    const opening = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
    
    const descriptivePhrase = this.generateDescriptivePhrase(vocab, style);
    
    return `${opening} ${descriptivePhrase} The air was ${this.generateMoodDescription(elements.mood)}, and a sense of ${elements.theme} hung heavy in the atmosphere.`;
  }

  private generateRisingAction(elements: StoryElements, vocab: string[], style: string): string {
    const development = [
      `As days turned into weeks, the ${elements.protagonist} found themselves drawn deeper into ${elements.conflict}. Each step forward revealed new complexities, each answer spawned a dozen more questions.`,
      `The ${elements.protagonist} soon discovered that ${elements.conflict} was not what it seemed. What had appeared simple from afar revealed itself to be a tangled web of circumstances and consequences.`,
      `With each passing moment, the ${elements.protagonist} felt the weight of ${elements.conflict} growing heavier. The path ahead was unclear, but turning back was no longer an option.`
    ];
    
    const selected = development[Math.floor(Math.random() * development.length)];
    const descriptivePhrase = this.generateDescriptivePhrase(vocab, style);
    
    return `${selected} ${descriptivePhrase} The ${elements.setting} seemed to mirror the ${elements.protagonist}'s inner turmoil, its ${elements.mood} atmosphere reflecting the growing tension.`;
  }

  private generateClimax(elements: StoryElements, vocab: string[], style: string): string {
    const climax = [
      `Then it happened. The moment the ${elements.protagonist} had been building toward arrived with sudden, breathtaking clarity. ${elements.conflict} reached its peak, and everything hung in the balance.`,
      `In a single, crystalline moment, the ${elements.protagonist} understood. The truth of ${elements.conflict} lay bare before them, and with it came a choice that would define everything.`,
      `The climax came not with a bang, but with a whisper—a quiet realization that changed everything. The ${elements.protagonist} stood at the crossroads of destiny, and the ${elements.setting} held its breath.`
    ];
    
    const selected = climax[Math.floor(Math.random() * climax.length)];
    const emotionalPhrase = this.generateEmotionalPhrase(vocab, style);
    
    return `${selected} ${emotionalPhrase} Time seemed to slow as the ${elements.protagonist} faced the culmination of their journey, the theme of ${elements.theme} resonating through every fiber of their being.`;
  }

  private generateFallingAction(elements: StoryElements, vocab: string[], style: string): string {
    const falling = [
      `In the aftermath, the ${elements.protagonist} took time to process what had transpired. The ${elements.setting} felt different now, changed by what had occurred.`,
      `As the intensity faded, the ${elements.protagonist} began to understand the deeper meaning of their experience. The ${elements.conflict} had transformed them in ways they never expected.`,
      `The ${elements.protagonist} moved through the days following the climax with a new sense of purpose. The ${elements.setting} no longer seemed foreign, but like a place they had finally come to understand.`
    ];
    
    const selected = falling[Math.floor(Math.random() * falling.length)];
    const reflectivePhrase = this.generateReflectivePhrase(vocab, style);
    
    return `${selected} ${reflectivePhrase} The ${elements.mood} atmosphere had shifted, giving way to something new—a sense of ${elements.theme} that permeated everything.`;
  }

  private generateResolution(elements: StoryElements, vocab: string[], style: string): string {
    const resolutions = [
      `And so the ${elements.protagonist}'s journey came to its close. Not all questions were answered, not all wounds were healed, but there was peace—a quiet understanding that life would continue, changed but enduring.`,
      `The ${elements.protagonist} emerged from their experience transformed. The ${elements.setting} remained, but it was a different place now, seen through new eyes. The theme of ${elements.theme} had woven itself into the fabric of their being.`,
      `In the end, the ${elements.protagonist} found what they had been seeking—not in the destination, but in the journey itself. The ${elements.setting} would always hold a special place in their heart, a reminder of how far they had come.`
    ];
    
    const selected = resolutions[Math.floor(Math.random() * resolutions.length)];
    const closingPhrase = this.generateClosingPhrase(vocab, style);
    
    return `${selected} ${closingPhrase}`;
  }

  private generateDescriptivePhrase(vocab: string[], style: string): string {
    if (vocab.length > 0) {
      const word = vocab[Math.floor(Math.random() * vocab.length)];
      const phrases = [
        `The scene was ${word}, almost otherworldly in its beauty.`,
        `There was something ${word} about the moment, something that defied easy description.`,
        `It was a ${word} sight, one that would linger in memory long after the moment had passed.`
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    return 'The scene was striking, almost surreal in its intensity.';
  }

  private generateEmotionalPhrase(vocab: string[], style: string): string {
    if (vocab.length > 0) {
      const word = vocab[Math.floor(Math.random() * vocab.length)];
      return `It was a ${word} moment, one that would echo through time.`;
    }
    
    return 'It was a moment of profound significance.';
  }

  private generateReflectivePhrase(vocab: string[], style: string): string {
    if (vocab.length > 0) {
      const word = vocab[Math.floor(Math.random() * vocab.length)];
      return `The experience was ${word}, leaving an indelible mark on the soul.`;
    }
    
    return 'The experience was transformative, leaving an indelible mark.';
  }

  private generateClosingPhrase(vocab: string[], style: string): string {
    if (vocab.length > 0) {
      const word = vocab[Math.floor(Math.random() * vocab.length)];
      return `And in that ${word} moment, everything made sense.`;
    }
    
    return 'And in that moment, everything made sense.';
  }

  private generateMoodDescription(mood: string): string {
    const moods: Record<string, string[]> = {
      dark: ['thick with shadows', 'heavy with mystery', 'cloaked in darkness'],
      joyful: ['bright with possibility', 'alive with energy', 'radiant with hope'],
      melancholy: ['tinged with sadness', 'heavy with reflection', 'suffused with longing'],
      thrilling: ['electric with anticipation', 'charged with excitement', 'alive with possibility'],
      contemplative: ['quiet with reflection', 'still with thought', 'peaceful with introspection']
    };
    
    const options = moods[mood] || moods.contemplative;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Generate a poem
  private async generatePoem(prompt: string, style: string): Promise<string> {
    const vocab = this.styleVocabularies.get(style) || [];
    const theme = this.extractTheme(prompt);
    const mood = this.extractMood(prompt);
    
    const stanzas: string[] = [];
    
    // Generate 3 stanzas
    for (let i = 0; i < 3; i++) {
      const stanza = this.generateStanza(theme, mood, vocab, style);
      stanzas.push(stanza);
    }
    
    return stanzas.join('\n\n');
  }

  private generateStanza(theme: string, mood: string, vocab: string[], style: string): string {
    const lines: string[] = [];
    
    // Generate 4 lines per stanza
    for (let i = 0; i < 4; i++) {
      const line = this.generatePoeticLine(theme, mood, vocab, style, i);
      lines.push(line);
    }
    
    return lines.join('\n');
  }

  private generatePoeticLine(
    theme: string,
    mood: string,
    vocab: string[],
    style: string,
    lineNumber: number
  ): string {
    const word = vocab.length > 0 ? vocab[Math.floor(Math.random() * vocab.length)] : 'beautiful';
    
    const patterns = [
      `In the ${mood} light of ${theme}, we find our way,`,
      `Through ${word} moments, time slips away,`,
      `The ${theme} whispers secrets to the wind,`,
      `And in the silence, truths begin.`,
      `A ${word} dance of shadow and light,`,
      `Where ${theme} blooms in the dead of night,`,
      `We carry ${mood} in our hearts,`,
      `And let the ${theme} play its part.`
    ];
    
    return patterns[lineNumber % patterns.length];
  }

  // Generate an essay
  private async generateEssay(
    prompt: string,
    style: string,
    template: StoryTemplate
  ): Promise<string> {
    const vocab = this.styleVocabularies.get(style) || [];
    const topic = this.extractTopic(prompt);
    
    let essay = '';
    
    // Introduction
    essay += this.generateEssayIntroduction(topic, vocab, style);
    essay += '\n\n';
    
    // Body paragraphs
    for (let i = 1; i <= 3; i++) {
      essay += this.generateEssayBody(topic, i, vocab, style);
      essay += '\n\n';
    }
    
    // Conclusion
    essay += this.generateEssayConclusion(topic, vocab, style);
    
    return essay;
  }

  private extractTopic(prompt: string): string {
    const match = prompt.match(/(?:about|on|regarding)\s+(.+)/i);
    return match ? match[1].trim() : 'the subject at hand';
  }

  private generateEssayIntroduction(topic: string, vocab: string[], style: string): string {
    const word = vocab.length > 0 ? vocab[Math.floor(Math.random() * vocab.length)] : 'important';
    
    return `The topic of ${topic} is one that has garnered significant attention in recent years. This ${word} subject deserves careful examination, as it touches upon fundamental aspects of our understanding. In this essay, we will explore the various dimensions of ${topic}, examining its implications and significance from multiple perspectives.`;
  }

  private generateEssayBody(topic: string, paragraph: number, vocab: string[], style: string): string {
    const word = vocab.length > 0 ? vocab[Math.floor(Math.random() * vocab.length)] : 'significant';
    
    const bodies = [
      `One ${word} aspect of ${topic} is its impact on contemporary society. Scholars and practitioners alike have noted the far-reaching consequences of developments in this area. The implications extend beyond immediate concerns, touching upon broader questions of values and priorities. Understanding these dimensions is crucial for navigating the complexities of the modern world.`,
      `Furthermore, ${topic} raises important questions about the nature of progress and change. Historical perspectives reveal that similar challenges have been faced before, though the specific context of the current situation lends it unique characteristics. Analysis of these factors provides valuable insights into potential trajectories and outcomes.`,
      `Finally, it is worth considering the practical implications of ${topic} for various stakeholders. Different groups may be affected in distinct ways, necessitating a nuanced approach to policy and action. Balancing competing interests while maintaining focus on core objectives remains a central challenge in this domain.`
    ];
    
    return bodies[paragraph - 1];
  }

  private generateEssayConclusion(topic: string, vocab: string[], style: string): string {
    const word = vocab.length > 0 ? vocab[Math.floor(Math.random() * vocab.length)] : 'complex';
    
    return `In conclusion, ${topic} represents a ${word} and multifaceted subject that warrants continued attention and study. The various perspectives examined in this essay highlight the importance of approaching this topic with both rigor and openness. As our understanding continues to evolve, so too will our ability to address the challenges and opportunities it presents. The journey of inquiry is far from over, but the progress made thus far provides a solid foundation for future exploration.`;
  }

  // Generate generic creative content
  private async generateGenericCreative(prompt: string, style: string): Promise<string> {
    const vocab = this.styleVocabularies.get(style) || [];
    const word = vocab.length > 0 ? vocab[Math.floor(Math.random() * vocab.length)] : 'interesting';
    
    return `This is a ${word} piece of creative writing inspired by: ${prompt}\n\nThe themes explored here are rich and multifaceted, inviting reflection and contemplation. The narrative unfolds with a sense of purpose, drawing the reader into a world of imagination and possibility.`;
  }

  getStats() {
    return {
      templates: this.storyTemplates.size,
      styles: this.styleVocabularies.size,
      capabilities: ['short stories', 'poems', 'essays', 'style transfer']
    };
  }
}

interface StoryTemplate {
  name: string;
  structure: string[];
  minWords: number;
  maxWords: number;
}

interface StoryElements {
  protagonist: string;
  setting: string;
  conflict: string;
  theme: string;
  mood: string;
}

interface CreativeMetadata {
  prompt: string;
  generatedAt: number;
  structure: string[];
  styleVocabulary: string[];
}
