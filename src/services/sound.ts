/**
 * Web Audio API Sound Synthesizer
 * Tự tổng hợp 100% âm thanh chuẩn bằng Web Audio API, không phụ thuộc file ngoài,
 * hoạt động hoàn hảo mọi lúc kể cả khi không có kết nối internet.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.8;

  constructor() {
    // Khởi tạo AudioContext khi cần (lazy load để tuân thủ autoplay policy trình duyệt)
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx && this.soundEnabled) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Tiếng tích tắc đếm ngược thông thường
   */
  public playTick() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {
      console.warn('Audio tick error:', e);
    }
  }

  /**
   * Tiếng tích tắc khẩn cấp (3 giây cuối)
   */
  public playUrgentTick() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;

      // Hai tần số kết hợp tạo cảm giác khẩn trương
      [1400, 1800].forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.07);
      });
    } catch (e) {
      console.warn('Audio urgent tick error:', e);
    }
  }

  /**
   * Tiếng chuông báo hết giờ / hạ bảng (âm ngân vang của chuông đồng lớn)
   */
  public playTimeUp() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      // Tần số cộng hưởng chuông đồng
      const freqs = [523.25, 784, 1046.5, 1568]; // C5, G5, C6, G6
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        const initialGain = 0.4 / (idx + 1);
        gain.gain.setValueAtTime(initialGain, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 2.6);
      });
    } catch (e) {
      console.warn('Audio timeUp error:', e);
    }
  }

  /**
   * Tiếng công bố đáp án đúng (âm vang trong trẻo, hân hoan)
   */
  public playCorrect() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      // Hợp âm trưởng rực rỡ (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = t + i * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.3, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.85);
      });
    } catch (e) {
      console.warn('Audio correct error:', e);
    }
  }

  /**
   * Tiếng buzz sai nhẹ
   */
  public playWrong() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.linearRampToValueAtTime(110, t + 0.25);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.warn('Audio wrong error:', e);
    }
  }

  /**
   * Tiếng chuông vàng ngân vang khi chạm vào chuông
   */
  public playGoldenBell() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      // Chuông vàng lớn: hòa âm phong phú kéo dài 4 giây
      const harmonics = [
        { f: 440, g: 0.5, d: 4.0 },   // A4
        { f: 880, g: 0.35, d: 3.5 },  // A5
        { f: 1320, g: 0.25, d: 3.0 }, // E6
        { f: 1760, g: 0.15, d: 2.2 }, // A6
        { f: 2200, g: 0.1, d: 1.8 },  // C#7
        { f: 2794, g: 0.08, d: 1.2 }  // F7
      ];

      harmonics.forEach(({ f, g, d }) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(g, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + d + 0.1);
      });
    } catch (e) {
      console.warn('Audio golden bell error:', e);
    }
  }

  /**
   * Khúc nhạc Fanfare mừng chiến thắng rực rỡ
   */
  public playFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      // Giai điệu vinh quang: C4 -> C4 -> C4 -> F4 -> A4 -> C5
      const melody = [
        { f: 523.25, start: 0.0, dur: 0.18 }, // C5
        { f: 523.25, start: 0.20, dur: 0.18 }, // C5
        { f: 523.25, start: 0.40, dur: 0.18 }, // C5
        { f: 659.25, start: 0.60, dur: 0.35 }, // E5
        { f: 783.99, start: 1.00, dur: 0.25 }, // G5
        { f: 1046.5, start: 1.30, dur: 1.50 }, // C6 kéo dài
      ];

      melody.forEach(({ f, start, dur }) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = t + start;

        // Âm sắc đồng (brass/chime) kết hợp sine & sawtooth nhẹ qua lowpass
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteStart);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.35, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + dur + 0.05);
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }

  /**
   * Tiếng pháo hoa nổ
   */
  public playFirework() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      // Tạo tiếng bùm trầm + tiếng rít noise
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(150, t + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.4);

      // Thêm tiếng boom bass thấp
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(140, t);
      bassOsc.frequency.exponentialRampToValueAtTime(40, t + 0.4);

      bassGain.gain.setValueAtTime(0.35, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(t);
      bassOsc.stop(t + 0.42);
    } catch (e) {
      console.warn('Audio firework error:', e);
    }
  }

  /**
   * Tiếng quay số trúng thưởng (ratchet click)
   */
  public playSlotSpin() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700 + Math.random() * 300, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {
      console.warn('Audio slotSpin error:', e);
    }
  }

  /**
   * Tiếng trúng số may mắn
   */
  public playSlotWin() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + 0.95);
      });
    } catch (e) {
      console.warn('Audio slotWin error:', e);
    }
  }
}

export const sound = new SoundService();
