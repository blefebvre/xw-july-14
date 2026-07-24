/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base block: columns.
 * Variant: columns-feature (xwalk project — Columns block).
 * Source: https://www.allianz.com/en.html (Allianz Group homepage).
 * Generated: 2026-07-23
 * Validated against migration-work/block-context/columns-feature/source.html and the
 * Bright Data snapshot (tools/importer/bd-snapshots/en.html.html).
 *
 * This variant is used for three distinct layouts, each matched by its own selector
 * in page-templates.json; the parser is invoked once per matched .multi-column-grid:
 *   - Investor Relations / Results promo panels (3 cells: 2 text panels + 1 iframe widget)
 *   - "Allianz at a glance" stats band (4 cells: big number + caption + optional source note)
 *   - Careers image + rich-text panel (2 cells) — this selector also matches the section's
 *     heading-only grid, handled by the empty-block guard below.
 *
 * Library structure (Columns): first row = block name; row 2 = N column cells (one per column);
 * every additional row must have the same number of cells.
 *
 * xwalk note (hinting.md Rule 4): Columns blocks do NOT get field hints — cells contain
 * default content only. So no <!-- field:* --> comments are emitted here.
 */
export default function parse(element, { document }) {
  // The columns live in the first .l-grid__row of this grid. Its direct .column children
  // are the individual columns. Use direct children so nested inner grids (e.g. the link
  // sub-grid inside a panel, or a nested feature grid) are not mistaken for top-level columns.
  const row = element.querySelector(':scope > div > .l-grid__row')
    || element.querySelector('.l-grid__row');

  const columns = row
    ? Array.from(row.children).filter((c) => c.classList && c.classList.contains('column'))
    : [];

  // Build one cell per column, preserving the column's rich content
  // (headings, copy, big-number statistics, images, iframes, links/buttons).
  const cellContents = columns.map((col) => {
    const parts = [];
    // Move every meaningful direct child of the column into the cell, in document order.
    Array.from(col.children).forEach((child) => {
      // Skip spacer-only helpers that carry no content.
      if (child.classList && child.classList.contains('spacer') && !child.textContent.trim()
        && !child.querySelector('img, iframe, a')) {
        return;
      }
      parts.push(child);
    });
    return parts;
  });

  // A column is considered non-empty if it contributes renderable content
  // (text, image, iframe, or link).
  const nonEmpty = cellContents.filter((parts) => parts.length > 0
    && parts.some((el) => el.textContent.trim() || el.querySelector('img, iframe, a')));

  // Guard: a Columns block presents content side by side, so it needs at least two
  // columns with real content. Grids with fewer (e.g. the careers section's
  // heading-only grid, which is a single filled column + an empty one) are not true
  // columns blocks — unwrap them so their content becomes default content instead of
  // a degenerate columns block with an empty cell.
  if (columns.length === 0 || nonEmpty.length < 2) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row 2: one cell per column. Keep every column (including intentionally sparse ones)
  // so the column count stays consistent across the row.
  const columnRow = cellContents.map((parts) => (parts.length ? parts : ''));

  const cells = [columnRow];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
