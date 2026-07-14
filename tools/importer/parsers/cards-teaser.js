/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base block: cards (container).
 * Source: https://privacy.abbvie/ (AbbVie Privacy Center homepage — three-up card grid)
 * Generated: 2026-07-14
 * Validated against source.html and live homepage selectors.
 *
 * Library structure (cards): container block, no block-level properties.
 *   Row 1: block name.
 *   Each subsequent row = one card, with 2 cells:
 *     Cell 1: image/icon        -> UE model field: image (imageAlt collapsed into img alt attr)
 *     Cell 2: text (richtext)   -> UE model field: text (heading + description + CTA)
 *   An image or text cell may be empty, but the cell must still be present.
 *
 * xwalk field hints: <!-- field:image --> before the image cell content,
 * <!-- field:text --> before the text cell content. imageAlt is a collapsed
 * field (rendered as the img alt attribute), so it gets no hint of its own.
 */
export default function parse(element, { document }) {
  // Each card is a column in the responsive row grid.
  let cardCols = Array.from(element.querySelectorAll(':scope .cmp-row__col'));

  // Fallback: some pages may not use the cmp-row__col wrapper.
  if (cardCols.length === 0) {
    cardCols = Array.from(element.querySelectorAll(':scope .image')).map((img) => img.parentElement);
  }

  const cells = [];

  cardCols.forEach((col) => {
    // --- Image cell (field:image) ---
    // Use the <img> itself so its alt attribute (collapsed imageAlt) is preserved.
    const img = col.querySelector('.image img, .cmp-image__image, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      // Ensure alt is populated from title if missing.
      if (!img.getAttribute('alt')) {
        const t = img.getAttribute('title');
        if (t) img.setAttribute('alt', t);
      }
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // --- Text cell (field:text): heading + description + CTA ---
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    const textContainer = col.querySelector('.text .cmp-text, .text, .cmp-text');
    if (textContainer) {
      // Move all rich content (heading, paragraphs, CTA link) into the cell.
      Array.from(textContainer.childNodes).forEach((node) => {
        textCell.appendChild(node);
      });
    } else {
      // Fallback: pull recognizable pieces directly.
      const heading = col.querySelector('h1, h2, h3, h4, [class*="title"]');
      const paras = Array.from(col.querySelectorAll('p'));
      if (heading) textCell.appendChild(heading);
      paras.forEach((p) => textCell.appendChild(p));
    }

    // Skip fully empty cards.
    if (!img && !textContainer) return;

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
