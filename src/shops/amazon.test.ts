import { describe, it, expect, beforeEach } from 'vitest';
import { amazonShop } from './amazon';
import { JSDOM } from 'jsdom';

describe('amazonShop.getPriceAndWeightInfo', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
  });

  it('correctly extracts price per kg from offscreen element', () => {
    document.body.innerHTML = `
     <span class="aok-relative"><span class="a-size-mini aok-offscreen"> &amp;euro;29.16 per kg </span><span aria-hidden="true" class="a-size-mini a-color-base aok-align-center pricePerUnit">(<span class="a-price a-text-price" data-a-size="mini" data-a-color="base"><span class="a-offscreen">€29.16</span><span aria-hidden="true">€29.16</span></span> / kg)</span></span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeCloseTo(29.16, 2);
  });

  it('correctly extracts price per kg from visible text', () => {
    document.body.innerHTML = `
      <span class="aok-relative">
        <span class="a-size-mini aok-offscreen">&euro;16.19 per kg</span>
        <span aria-hidden="true" class="a-size-mini a-color-base aok-align-center pricePerUnit">
          (<span class="a-price a-text-price" data-a-size="mini" data-a-color="base">
            <span class="a-offscreen">€16.19</span>
            <span aria-hidden="true">€16.19</span>
          </span> / kg)
        </span>
      </span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeCloseTo(16.19, 2);
  });

  it('returns null when no price information is found', () => {
    document.body.innerHTML = `
      <span class="aok-relative">
        <span class="a-size-mini a-color-base">No price information available</span>
      </span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeNull();
  });

  it('correctly handles price per gram', () => {
    document.body.innerHTML = `
      <span class="aok-relative">
        <span class="a-size-mini aok-offscreen">&euro;0.0292 per g</span>
        <span aria-hidden="true" class="a-size-mini a-color-base aok-align-center pricePerUnit">
          (<span class="a-price a-text-price" data-a-size="mini" data-a-color="base">
            <span class="a-offscreen">€0.0292</span>
            <span aria-hidden="true">€0.0292</span>
          </span> / g)
        </span>
      </span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeCloseTo(29.2, 2);
  });

  it('correctly extracts price per kg from the provided HTML structure', () => {
    document.body.innerHTML = `
      <span class="aok-relative"><span class="a-size-mini aok-offscreen"> &amp;euro;16.19 per kg </span><span aria-hidden="true" class="a-size-mini a-color-base aok-align-center pricePerUnit">(<span class="a-price a-text-price" data-a-size="mini" data-a-color="base"><span class="a-offscreen">€16.19</span><span aria-hidden="true">€16.19</span></span> / kg)</span></span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeCloseTo(16.19, 2);
  });

  it('correctly handles price per 100g', () => {
    document.body.innerHTML = `
      <span aria-hidden="true" class="a-size-mini a-color-base aok-align-center pricePerUnit">(<span class="a-price a-text-price" data-a-size="mini" data-a-color="base"><span class="a-offscreen">£2.65</span><span aria-hidden="true">£2.65</span></span> /100 g)</span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeCloseTo(26.5, 2);
  });

  it('correctly extracts price per kg from aria-hidden="false" element', () => {
    document.body.innerHTML = `
      <span class="aok-relative"><span aria-hidden="false" class="a-size-mini a-color-base aok-align-center a-text-normal">(<span class="a-price a-text-price" data-a-size="mini" data-a-color="base"><span class="a-offscreen">£4.67</span><span aria-hidden="true">£4.67</span></span> / kg)</span></span>
    `;

    const result = amazonShop.getPriceAndWeightInfo(document);
    expect(result.pricePerKg).toBeCloseTo(4.67, 2);
  });
});
