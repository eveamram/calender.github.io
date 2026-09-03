import confetti from 'canvas-confetti';
import { isAnniversaryDate, isAnniversaryTitle } from './holidays';

export function burstHearts() {
  const heartA = confetti.shapeFromText({ text: '💕', scalar: 2 });
  const heartB = confetti.shapeFromText({ text: '❤️', scalar: 1.8 });
  const heartC = confetti.shapeFromText({ text: '💗', scalar: 1.6 });
  const shapes = [heartA, heartB, heartC];
  const colors = ['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#be185d', '#fbcfe8'];

  confetti({
    shapes,
    colors,
    particleCount: 48,
    spread: 85,
    origin: { y: 0.7, x: 0.5 },
    startVelocity: 34,
    gravity: 0.8,
    scalar: 1.2,
    ticks: 240,
  });
  confetti({
    shapes,
    colors,
    particleCount: 28,
    spread: 110,
    origin: { y: 0.58, x: 0.32 },
    startVelocity: 24,
    scalar: 0.95,
  });
  confetti({
    shapes,
    colors,
    particleCount: 28,
    spread: 110,
    origin: { y: 0.58, x: 0.68 },
    startVelocity: 24,
    scalar: 0.95,
  });
}

export function celebrateComplete(opts: {
  dateStr?: string;
  title?: string;
  fallbackConfetti?: boolean;
}) {
  const anniversary =
    Boolean(opts.dateStr && isAnniversaryDate(opts.dateStr)) || isAnniversaryTitle(opts.title);
  if (anniversary) {
    burstHearts();
    return;
  }
  if (opts.fallbackConfetti) {
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  }
}
