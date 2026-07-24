/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base block: hero.
 * Variant: hero-banner (xwalk project).
 * Source: https://www.allianz.com/en.html (Allianz Group homepage — hero stage).
 * Generated: 2026-07-23
 * Validated against migration-work/block-context/hero-banner/source.html and the
 * Bright Data snapshot (tools/importer/bd-snapshots/en.html.html). Selector matches 1 element.
 *
 * Library structure (Hero): 1 column, up to 3 rows.
 *   Row 1: block name.
 *   Row 2: background image (optional)      -> UE model field: image (imageAlt collapsed into img alt attr)
 *   Row 3: title + subheading + CTA (rich)  -> UE model field: text
 *
 * xwalk field hints (per hinting.md): <!-- field:image --> before the background
 * image cell; <!-- field:text --> before the content cell. imageAlt is a collapsed
 * field (rendered as the img alt attribute), so it gets no hint of its own.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (validated against Allianz source.html) ---
  // Full-bleed background photo. Allianz markup: <picture class="c-stage__image"> containing
  // <img class="c-image__img abovethefoldimage">. Prefer the stage image, then any block image.
  const bgImage = element.querySelector(
    '.c-stage__image img, .c-image__img, picture img, img',
  );

  // Headline. Allianz markup: <h1 class="c-heading"> inside .headline. Fall back to any heading.
  const heading = element.querySelector(
    '.headline h1, .headline h2, .c-stage__content h1, .c-stage__content h2, h1, h2',
  );

  // Optional subheading / description paragraph(s).
  const description = element.querySelector('.c-stage__content .c-copy, .c-copy');

  // Optional CTA(s). Allianz markup: <a class="c-button ..."> inside .button.
  // Use distinct, mutually-exclusive selectors so an <a> is never double-selected.
  const ctaLinks = Array.from(
    element.querySelectorAll('.button a.c-button, a.c-button'),
  ).filter((a, i, arr) => arr.indexOf(a) === i);

  // Empty-block guard.
  if (!heading && !description && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 (optional): background image with field:image hint.
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage);
    cells.push([imageCell]);
  }

  // Row 3: content (title + subheading + CTA) with field:text hint.
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:text '));
  if (heading) contentCell.appendChild(heading);
  if (description) contentCell.appendChild(description);
  ctaLinks.forEach((cta) => contentCell.appendChild(cta));
  cells.push([contentCell]); // 1-column hero: one row, one cell holding all content.

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
