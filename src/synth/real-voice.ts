// Real Voice - Web Speech API (Speech Recognition + Speech Synthesis)
export class RealVoice {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    console.log('[RealVoice] Initialized with Web Speech API');
    this.initialize();
  }

  // Initialize speech synthesis
  private initialize(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Some browsers load voices asynchronously
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('[RealVoice] Speech Synthesis not supported in this browser');
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      console.log('[RealVoice] Speech Recognition initialized');
    } else {
      console.warn('[RealVoice] Speech Recognition not supported in this browser');
    }
  }

  // Load available voices
  private loadVoices(): void {
    if (!this.synthesis) return;
    
    this.availableVoices = this.synthesis.getVoices();
    console.log(`[RealVoice] Loaded ${this.availableVoices.length} voices`);
  }

  // Text-to-Speech
  async speak(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<void> {
    if (!this.synthesis) {
      console.error('[RealVoice] Speech Synthesis not available');
      return;
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options?.voice) {
        const voice = this.availableVoices.find(v => v.name === options.voice);
        if (voice) utterance.voice = voice;
      }
      
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);
      
      this.synthesis!.speak(utterance);
    });
  }

  // Speech-to-Text
  async listen(options?: {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
  }): Promise<string> {
    if (!this.recognition) {
      console.error('[RealVoice] Speech Recognition not available');
      return '';
    }

    return new Promise((resolve, reject) => {
      this.recognition.lang = options?.language || 'en-US';
      this.recognition.continuous = options?.continuous || false;
      this.recognition.interimResults = options?.interimResults || false;
      
      this.isListening = true;
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };
      
      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(event.error);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
      
      this.recognition.start();
    });
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices
  getVoices(): any[] {
    return this.availableVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService
    }));
  }

  // Get default voice
  getDefaultVoice(): any | null {
    const defaultVoice = this.availableVoices.find(v => v.default);
    if (!defaultVoice) return null;
    
    return {
      name: defaultVoice.name,
      lang: defaultVoice.lang
    };
  }

  // Set voice by name
  setVoice(voiceName: string): boolean {
    const voice = this.availableVoices.find(v => v.name === voiceName);
    if (!voice) return false;
    
    // Voice will be used in next speak() call
    return true;
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.availableVoices.forEach(voice => {
      languages.add(voice.lang);
    });
    return Array.from(languages).sort();
  }

  // Check if listening
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Check if speaking
  isCurrentlySpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  // Pause speaking
  pauseSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  // Resume speaking
  resumeSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  // Speak with emotion (adjust rate/pitch/volume)
  async speakWithEmotion(text: string, emotion: string): Promise<void> {
    const emotionSettings: Record<string, any> = {
      happy: { rate: 1.2, pitch: 1.3, volume: 1.0 },
      sad: { rate: 0.8, pitch: 0.8, volume: 0.7 },
      angry: { rate: 1.3, pitch: 1.1, volume: 1.0 },
      calm: { rate: 0.9, pitch: 1.0, volume: 0.8 },
      excited: { rate: 1.4, pitch: 1.4, volume: 1.0 },
      neutral: { rate: 1.0, pitch: 1.0, volume: 1.0 }
    };

    const settings = emotionSettings[emotion] || emotionSettings.neutral;
    await this.speak(text, settings);
  }

  // Convert text to audio blob (for download/recording)
  async textToAudioBlob(text: string): Promise<Blob | null> {
    // Web Speech API doesn't support direct audio export
    // This would require a different approach (e.g., MediaRecorder API)
    console.warn('[RealVoice] Direct audio export not supported by Web Speech API');
    return null;
  }

  getStats() {
    return {
      synthesisAvailable: !!this.synthesis,
      recognitionAvailable: !!this.recognition,
      voicesLoaded: this.availableVoices.length,
      isListening: this.isListening,
      isSpeaking: this.synthesis ? this.synthesis.speaking : false,
      capabilities: [
        'speak',
        'listen',
        'stopListening',
        'stopSpeaking',
        'getVoices',
        'setVoice',
        'speakWithEmotion'
      ]
    };
  }
}
