/** A presentation timeline: story decisions remain authored, not visitor actions. */
export function readingDuration(frame, language = 'en') {
  const caption = frame.caption[language];
  const action = frame.action[language];
  const factor = language === 'zh' ? 180 : 55;
  return Math.max(7500, (caption.length + action.length) * factor, frame.boundary ? 12000 : 0);
}
export class GuidedPlayer {
  constructor(frames, index = 0, language = 'en') {
    this.frames = frames; this.index = index; this.language = language;
    this.elapsed = 0; this.playing = false;
  }
  play() { if (this.index < this.frames.length - 1) this.playing = true; }
  pause() { this.playing = false; }
  select(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.frames.length) return false;
    this.index = index; this.elapsed = 0; this.pause(); return true;
  }
  tick(milliseconds) {
    if (!this.playing || !Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds > 1000) return false;
    this.elapsed += milliseconds;
    if (this.elapsed < readingDuration(this.frames[this.index], this.language)) return false;
    this.elapsed = 0; this.index++;
    if (this.index >= this.frames.length - 1) this.pause();
    return true;
  }
}
