import { ColorThresholds } from './types';

// source: i made them up
export const COLOR_THRESHOLDS: Record<string, ColorThresholds> = {
  proteinPerCurrency: { good: 12, bad: 4 },
  proteinToCarbRatio: { good: 2, bad: 0.1 },
  proteinPer100Calories: { good: 10, bad: 3 },
};

const COLORS = {
  red: [220, 53, 69],
  yellow: [255, 193, 7],
  green: [40, 167, 69],
};

export function interpolateColor(color1: number[], color2: number[], factor: number): number[] {
  return color1.map((channel, i) => Math.round(channel + factor * (color2[i] - channel)));
}

export function getColorForValue(value: string, thresholds: ColorThresholds): string {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';

  let factor = (numValue - thresholds.bad) / (thresholds.good - thresholds.bad);
  factor = Math.max(0, Math.min(1, factor));

  const { red, yellow, green } = COLORS;
  return `rgb(${interpolateColor(
    factor < 0.5 ? red : yellow,
    factor < 0.5 ? yellow : green,
    factor < 0.5 ? factor * 2 : (factor - 0.5) * 2
  )})`;
}

export function formatLabel(key: string, currency: string | null = null): string {
  switch (key) {
    case 'proteinPerCurrency':
      return `Protein per ${currency}`;
    case 'proteinPer100Calories':
      return 'Protein per 100 Calories';
    // ... other cases ...
    default:
      return (
        key.charAt(0).toUpperCase() +
        key
          .slice(1)
          .replace(/([A-Z])/g, ' $1')
          .trim()
      );
  }
}
