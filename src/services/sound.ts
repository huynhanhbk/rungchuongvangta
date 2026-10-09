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
   * Tiếng chuông vàng ngân vang khi chạm vào chuông (sử dụng âm thanh Bell chân thực)
   */
  public playGoldenBell() {
    this.playCelebrationChime();
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

  private celebrationGain: GainNode | null = null;
  private celebrationTimeout: number | null = null;

  public stopCelebrationChime() {
    if (this.celebrationGain && this.ctx) {
      try {
        this.celebrationGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.celebrationGain.disconnect();
      } catch (e) {
        // ignore
      }
      this.celebrationGain = null;
    }
    if (this.celebrationTimeout) {
      clearTimeout(this.celebrationTimeout);
      this.celebrationTimeout = null;
    }
  }

  /**
   * Tạo một nhịp chuông vang (Resonant Acoustic Bell Chime)
   * Thay thế hoàn toàn tiếng búa đanh thép bằng âm sắc chuông đồng ngân vang trong trẻo:
   * - Khởi đầu êm dịu (smooth attack, không dùng tiếng ồn va đập kim loại đanh gắt)
   * - Tầng âm bồi phong phú chuẩn vật lý chuông khánh (Hum, Prime, Tierce, Quint, Nominal)
   * - Hiệu ứng rung phách âm tự nhiên (acoustic beating & vibrato) ngân nga kéo dài.
   */
  private createAcousticBellStrike(f0: number, delay: number, intensity: number = 1.0) {
    if (!this.ctx || !this.celebrationGain) return;
    const t = this.ctx.currentTime + delay;

    // Các tầng hòa âm chuông đồng ngân vang (Carillon Acoustic Spectrum)
    // Không dùng tiếng đập búa (clapper noise); đòn tấn công mượt mà (smooth attack ~25-35ms)
    const partials = [
      { mult: 0.5, gain: 0.45, dur: 9.5, detune: 0 },         // Hum tone (trầm ấm, ngân sâu thẳm)
      { mult: 1.0, gain: 0.55, dur: 8.5, detune: 0 },         // Prime (âm chủ trong sáng)
      { mult: 1.0, gain: 0.35, dur: 8.2, detune: 1.4 },       // Prime detune (tạo phách rung beating du dương)
      { mult: 1.1892, gain: 0.38, dur: 7.2, detune: 0 },      // Tierce (quãng 3 thứ - linh hồn chuông ngân)
      { mult: 1.1892, gain: 0.25, dur: 7.0, detune: -1.2 },   // Tierce detune
      { mult: 1.4983, gain: 0.32, dur: 6.2, detune: 0 },      // Quint (quãng 5)
      { mult: 2.0, gain: 0.36, dur: 5.5, detune: 0 },         // Nominal (âm bát độ cao ngân nga)
      { mult: 2.51, gain: 0.20, dur: 4.2, detune: 0 },        // Decime
      { mult: 3.0, gain: 0.16, dur: 3.5, detune: 0 },         // Duodecime
      { mult: 4.0, gain: 0.10, dur: 2.5, detune: 0 },         // Upper Octave Sparkle
    ];

    partials.forEach(({ mult, gain: baseGain, dur, detune }) => {
      if (!this.ctx || !this.celebrationGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0 * mult + detune, t);

      const targetGain = baseGain * intensity * 0.26;
      gain.gain.setValueAtTime(0.0001, t);
      // Đòn tấn công êm dịu, không gắt tai, tạo độ ngân chuông sâu lắng (attack 30ms)
      gain.gain.exponentialRampToValueAtTime(targetGain, t + 0.03);
      // Độ ngân suy giảm tự nhiên kéo dài suốt nhiều giây
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(this.celebrationGain);

      osc.start(t);
      osc.stop(t + dur + 0.1);
    });
  }

  /**
   * Âm thanh Người Chiến Thắng Vinh Danh Rực Rỡ kết hợp Tiếng Chuông Vàng Ngân Vang (10 Giây)
   * Tái hiện khúc khải hoàn ca chiến thắng hùng tráng (Victory Fanfare Anthem)
   * kết hợp các hồi chuông đại khánh ngân nga 10 giây.
   */
  public playCelebrationChime() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      this.stopCelebrationChime();

      const chimeBranch = this.ctx.createGain();
      chimeBranch.gain.setValueAtTime(1, this.ctx.currentTime);
      chimeBranch.connect(this.masterGain);
      this.celebrationGain = chimeBranch;

      const t0 = this.ctx.currentTime;

      // ==============================================================
      // 1. KHÚC KHẢI HOÀN CA CHIẾN THẮNG (WINNER VICTORY FANFARE ANTHEM)
      // Giai điệu hùng tráng mừng người chiến thắng: 
      // Nhịp dạo mừng -> Chuỗi nốt chiến thắng cao trào -> Hợp âm vinh quang ngân vang
      // ==============================================================
      const victoryMotif = [
        // Nhịp khởi động chiến thắng rộn rã
        { f: 523.25, time: 0.00, dur: 0.14, gain: 0.35 },  // C5
        { f: 523.25, time: 0.15, dur: 0.14, gain: 0.35 },  // C5
        { f: 523.25, time: 0.30, dur: 0.14, gain: 0.35 },  // C5
        { f: 659.25, time: 0.46, dur: 0.36, gain: 0.42 },  // E5
        { f: 783.99, time: 0.84, dur: 0.36, gain: 0.44 },  // G5
        { f: 1046.50, time: 1.22, dur: 0.65, gain: 0.48 }, // C6 (đỉnh cao)

        // Câu tiếp nối hoan ca rực rỡ
        { f: 880.00, time: 1.90, dur: 0.16, gain: 0.38 },  // A5
        { f: 987.77, time: 2.08, dur: 0.16, gain: 0.38 },  // B5
        { f: 1046.50, time: 2.26, dur: 0.50, gain: 0.46 }, // C6
        { f: 1174.66, time: 2.78, dur: 0.28, gain: 0.40 }, // D6
        { f: 1318.51, time: 3.08, dur: 0.85, gain: 0.50 }, // E6 vút cao

        // Hồi kèn chiến thắng đại thành công (4.0s - 6.5s)
        { f: 1046.50, time: 4.00, dur: 0.22, gain: 0.42 }, // C6
        { f: 1174.66, time: 4.24, dur: 0.22, gain: 0.42 }, // D6
        { f: 1318.51, time: 4.48, dur: 0.35, gain: 0.45 }, // E6
        { f: 1567.98, time: 4.85, dur: 1.50, gain: 0.52 }, // G6 đỉnh vinh quang

        // Hợp âm vinh quang chiến thắng chốt hạ trang trọng (5.2s - 7.5s)
        { f: 523.25, time: 5.20, dur: 2.2, gain: 0.30 },   // C5
        { f: 659.25, time: 5.20, dur: 2.2, gain: 0.32 },   // E5
        { f: 783.99, time: 5.20, dur: 2.2, gain: 0.34 },   // G5
        { f: 1046.50, time: 5.20, dur: 2.5, gain: 0.38 },  // C6
      ];

      victoryMotif.forEach(({ f, time, dur, gain: noteGain }) => {
        if (!this.ctx || !this.celebrationGain) return;
        const noteStart = t0 + time;

        // Bộ dao động âm sắc kèn trumpet / kèn chiến thắng kết hợp brass harmonic
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(f, noteStart);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(f * 1.002, noteStart); // Detune nhẹ tạo độ dày dàn nhạc

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, noteStart);
        filter.frequency.exponentialRampToValueAtTime(1400, noteStart + dur);

        g.gain.setValueAtTime(0.0001, noteStart);
        g.gain.linearRampToValueAtTime(noteGain * 0.45, noteStart + 0.035);
        g.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(g);
        g.connect(this.celebrationGain);

        osc1.start(noteStart);
        osc2.start(noteStart);
        osc1.stop(noteStart + dur + 0.05);
        osc2.stop(noteStart + dur + 0.05);
      });

      // ==============================================================
      // 2. TIẾNG CHUÔNG VÀNG (BELL) NGÂN VANG ĐỒNG ĐIỆU SUỐT 10 GIÂY
      // ==============================================================
      // Hồi 1: Chuông khai hội ngay lúc chạm (t = 0s)
      this.createAcousticBellStrike(440, 0.0, 1.0);

      // Hồi 2: Chuông ngân đón khúc khải hoàn (t = 1.6s)
      this.createAcousticBellStrike(554.37, 1.6, 0.95);

      // Hồi 3: Chuông vàng cao trào rạng rỡ (t = 3.4s)
      this.createAcousticBellStrike(659.25, 3.4, 0.95);

      // Hồi 4: Đại hòa âm chuông vàng đăng quang (t = 5.2s)
      this.createAcousticBellStrike(440, 5.2, 0.85);
      this.createAcousticBellStrike(880, 5.2, 0.70);

      // Hồi 5: Dư âm tiếng chuông khánh vi vu thanh khiết (t = 7.2s -> 10s)
      this.createAcousticBellStrike(554.37, 7.2, 0.6);
      this.createAcousticBellStrike(659.25, 7.2, 0.5);

      // Tự động giải phóng sau 10.5 giây
      this.celebrationTimeout = window.setTimeout(() => {
        this.stopCelebrationChime();
      }, 10500);
    } catch (e) {
      console.warn('Audio celebration winner bell error:', e);
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
