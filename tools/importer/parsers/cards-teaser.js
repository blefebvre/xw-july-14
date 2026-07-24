/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base block: cards.
 * Variant: cards-teaser (xwalk project — container block with card children).
 * Source: https://www.allianz.com/en.html (Allianz Group homepage — "Insights & Specials").
 * Generated: 2026-07-23
 * Validated against migration-work/block-context/cards-teaser/source.html and the
 * Bright Data snapshot (tools/importer/bd-snapshots/en.html.html).
 *
 * IMPORTANT: the page-templates.json selector matches ONE card wrapper per feature item
 * (4 matches on this page), so this parser is invoked once per card. Each invocation
 * appends a single card row to a cards-teaser block.
 *
 * NOTE ON DOM: the four feature items alternate image side (image left / image right).
 * The image column is detected by content (which .column holds the <img>), not by position.
 *
 * Library structure (Cards): container block, first row = block name.
 *   Each row = one card with 2 cells:
 *     Cell 1: image/icon      -> UE model fields: image / imageAlt (Alt collapsed into img alt)
 *     Cell 2: rich text        -> UE model field: text (Title + Description + CTA link)
 *   An image or text cell may be empty, but the cell must still be present.
 *
 * xwalk field hints (per hinting.md): <!-- field:image --> before the image cell content,
 * <!-- field:text --> before the rich-text cell content. imageAlt is a collapsed field
 * (rendered as the img alt attribute), so it gets no hint of its own.
 */
export default function parse(element, { document }) {
  // The card's two columns live in the wrapper's first grid row.
  const row = element.querySelector('.l-grid__row');
  const columns = row
    ? Array.from(row.children).filter((c) => c.classList && c.classList.contains('column'))
    : [];

  // Identify the image column (the one that actually contains an <img>) and treat the
  // remaining content column as the text column — regardless of left/right ordering.
  let imageCol = columns.find((c) => c.querySelector('img')) || null;
  let textCol = columns.find((c) => c !== imageCol
    && (c.querySelector('h1, h2, h3, h4, .headline') || c.querySelector('.text, .c-copy, a')))
    || columns.find((c) => c !== imageCol)
    || null;

  // --- Image cell (field:image) ---
  const imageCell = document.createDocumentFragment();
  const img = imageCol ? imageCol.querySelector('img') : null;
  if (img) {
    // Ensure alt is populated (collapsed imageAlt field) from title if missing.
    if (!img.getAttribute('alt')) {
      const t = img.getAttribute('title');
      if (t) img.setAttribute('alt', t);
    }
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(img);
  }

  // --- Text cell (field:text): heading + description + CTA link(s) ---
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  const scope = textCol || element;
  const heading = scope.querySelector('.headline h1, .headline h2, .headline h3, .headline h4, h1, h2, h3, h4');
  if (heading) textCell.appendChild(heading);

  // Description: the card's own copy block.
  const description = scope.querySelector('.text .c-copy, .c-copy');
  if (description) textCell.appendChild(description);

  // CTA link(s): "More about" / hub links. Allianz markup uses <a class="c-link"> (and
  // occasionally <a class="c-button">). These are distinct classes, so no double-selection.
  const ctaLinks = Array.from(scope.querySelectorAll('a.c-link, a.c-button'));
  ctaLinks.forEach((a) => textCell.appendChild(a));

  // Empty-block guard: nothing meaningful in this card.
  if (!img && !heading && !description && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One 2-cell card row. The image cell is included even if empty so the column count holds.
  const cells = [[imageCell, textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
