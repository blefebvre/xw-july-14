/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base block: hero.
 * Source: https://privacy.abbvie/ (AbbVie Privacy Center homepage — category hero teaser)
 * Generated: 2026-07-14
 * Validated against source.html and live homepage selectors.
 *
 * Library structure (hero): 1 column, up to 3 rows.
 *   Row 1: block name.
 *   Row 2: background image (optional)      -> UE model field: image (imageAlt collapsed into img alt attr)
 *   Row 3: title + subheading + CTA (rich)  -> UE model field: text
 *
 * xwalk field hints: <!-- field:image --> before the background image cell,
 * <!-- field:text --> before the content cell. imageAlt is a collapsed field
 * (becomes the img alt attribute), so it gets no hint of its own.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (validated against source.html) ---
  // Background image lives in .cmp-teaser__image; the <img> carries the DM data-asset.
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Ensure the image has an alt so the collapsed imageAlt field is populated.
  if (bgImage && !bgImage.getAttribute('alt')) {
    const imgTitle = element.querySelector('.cmp-teaser__image-title span[title]');
    if (imgTitle) bgImage.setAttribute('alt', imgTitle.getAttribute('title') || '');
  }

  // Title styled as a heading. Prefer the content title; the image-title (.cmp-teaser__image-title)
  // is a decorative wrapper with no visible text, so it must not be selected.
  const heading = element.querySelector('.cmp-teaser__title')
    || element.querySelector('.cmp-teaser__content h1, .cmp-teaser__content h2, .cmp-teaser__content h3')
    || element.querySelector('h1, h2');

  // Subheading / description (richtext paragraphs).
  const description = element.querySelector(
    '.cmp-teaser__description-text, .cmp-teaser__description'
  );

  // Optional CTA(s).
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-container-wrapper a, .cmp-teaser__action a')
  );

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
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
