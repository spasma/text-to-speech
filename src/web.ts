import { WebPlugin } from '@capacitor/core';
import {
  TextToSpeechPlugin,
  SpeechSynthesisVoice,
  TTSOptions,
} from './definitions';

export class TextToSpeechWeb extends WebPlugin implements TextToSpeechPlugin {
  private currentlyActive = false;

  constructor() {
    super({
      name: 'TextToSpeech',
      platforms: ['web'],
    });
  }

  public async speak(options: TTSOptions): Promise<void> {
    const speechSynthesis = this.getSpeechSynthesis();
    if (this.currentlyActive) {
      return;
    }
    this.currentlyActive = true;
    const utterance = await this.createSpeechSynthesisUtterance(options);
    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        this.currentlyActive = false;
        resolve();
      };
      utterance.onerror = (event: any) => {
        this.currentlyActive = false;
        reject(event);
      };
      speechSynthesis.speak(utterance);
    });
  }

  public async stop(): Promise<void> {
    const speechSynthesis = this.getSpeechSynthesis();
    speechSynthesis.cancel();
  }

  public async getSupportedLanguages(): Promise<{ languages: string[] }> {
    const voices = this.getSpeechSynthesisVoices();
    const languages = voices.map(voice => voice.lang);
    return { languages };
  }

  public async getSupportedVoices(): Promise<{
    voices: SpeechSynthesisVoice[];
  }> {
    const voices = this.getSpeechSynthesisVoices();
    return { voices };
  }

  public async openInstall(): Promise<void> {
    this.throwNotImplementedError();
  }

  public async setPitchRate(_options: { pitchRate: number }): Promise<void> {
    this.throwNotImplementedError();
  }

  public async setSpeechRate(_options: { speechRate: number }): Promise<void> {
    this.throwNotImplementedError();
  }

  private async createSpeechSynthesisUtterance(
    options: TTSOptions,
  ): Promise<SpeechSynthesisUtterance> {
    const utterance = new SpeechSynthesisUtterance();
    const voices = this.getSpeechSynthesisVoices();
    const { text, locale, speechRate, volume, voice, pitchRate } = options;
    if (voice) {
      utterance.voice = voices[voice];
    }
    if (volume) {
      utterance.volume = volume >= 0 && volume <= 1 ? volume : 1;
    }
    if (speechRate) {
      utterance.rate = speechRate >= 0.1 && speechRate <= 10 ? speechRate : 1;
    }
    if (pitchRate) {
      utterance.pitch = pitchRate >= 0 && pitchRate <= 2 ? pitchRate : 2;
    }
    if (locale) {
      utterance.lang = locale;
    }
    utterance.text = text;
    return utterance;
  }

  private getSpeechSynthesisVoices(): SpeechSynthesisVoice[] {
    const speechSynthesis = this.getSpeechSynthesis();
    return speechSynthesis.getVoices();
  }

  private getSpeechSynthesis(): SpeechSynthesis {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis;
    }
    this.throwUnsupportedError();
  }

  private throwUnsupportedError(): never {
    throw new Error('Not supported on this device.');
  }

  private throwNotImplementedError(): never {
    throw new Error('Not implemented on web.');
  }
}

const TextToSpeech = new TextToSpeechWeb();

export { TextToSpeech };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(TextToSpeech);
