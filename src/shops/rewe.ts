import { NutrientInfo, PriceAndWeightInfo, Shop } from '../types';

const NUTRIENT_LABELS: Record<keyof NutrientInfo, string> = {
  protein: 'Eiweiß',
  carbs: 'Kohlenhydrate',
  sugar: 'Kohlenhydrate, davon Zucker',
  fat: 'Fett',
  calories: 'Energie',
  fiber: 'Ballaststoffe',
};

export const reweShop: Shop = {
  name: 'rewe',
  getNutrientInfo(doc: Document): NutrientInfo {
    const table = doc.querySelector('.pdpr-NutritionTable');
    const nutrientInfo: Partial<NutrientInfo> = {};

    table?.querySelectorAll('tbody tr').forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const labelCell = cells[0];
        const valueCell = cells[1];
        const label = labelCell.textContent?.trim();
        const value = valueCell.textContent?.trim().replace(',', '.');
        const nutrientKey = Object.keys(NUTRIENT_LABELS).find(
          (key) => NUTRIENT_LABELS[key as keyof NutrientInfo] === label
        ) as keyof NutrientInfo | undefined;

        if (nutrientKey && value) {
          nutrientInfo[nutrientKey] = value;
        }
      }
    });

    return nutrientInfo as NutrientInfo;
  },

  getPriceAndWeightInfo(doc: Document): PriceAndWeightInfo {
    const priceElement = doc.querySelector('.pdpr-Price__Price');
    const price = parseFloat(
      priceElement?.textContent?.trim().replace(',', '.').replace(' €', '') || '0'
    );
    const grammageElement = doc.querySelector('.pdsr-Grammage');
    const grammageText = grammageElement?.textContent?.trim() || '';

    const weightMatch = grammageText.match(/(\d+(?:,\d+)?)\s*(g|kg|ml|l)/i);
    let weight: number | null = null;
    if (weightMatch) {
      const value = parseFloat(weightMatch[1].replace(',', '.'));
      const unit = weightMatch[2].toLowerCase();
      weight = value * (unit === 'kg' || unit === 'l' ? 1000 : 1);
    }

    if (!weight && grammageText.includes('Stück')) {
      const pieceWeightMatch = grammageText.match(/ca\.\s*(\d+)\s*(g|ml)/i);
      weight = pieceWeightMatch ? parseInt(pieceWeightMatch[1]) : null;
    }

    const multiPackMatch = grammageText.match(/(\d+)x([\d,]+)\s*(g|kg|ml|l)/i);
    if (multiPackMatch) {
      const count = parseInt(multiPackMatch[1]);
      const value = parseFloat(multiPackMatch[2].replace(',', '.'));
      const unit = multiPackMatch[3].toLowerCase();
      weight = count * value * (unit === 'kg' || unit === 'l' ? 1000 : 1);
    }

    const pricePerKgMatch = grammageText.match(/1 (kg|l) = ([\d,]+) €/);
    const pricePerKg = pricePerKgMatch ? parseFloat(pricePerKgMatch[2].replace(',', '.')) : null;

    return { price, weight, pricePerKg };
  },

  getInsertionPoint(element: HTMLElement): HTMLElement | null {
    return element.querySelector('.bs_add2cart_container');
  },
};
