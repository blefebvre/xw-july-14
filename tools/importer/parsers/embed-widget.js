/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-widget. Base block: embed.
 * Variant: embed-widget (xwalk project).
 * Source: https://www.allianz.com/en.html (Allianz Group homepage).
 * Generated: 2026-07-23
 * Validated against migration-work/block-context/embed-widget/source.html and the
 * Bright Data snapshot (tools/importer/bd-snapshots/en.html.html).
 *
 * Two distinct usages, each matched by its own selector in page-templates.json; the
 * parser is invoked once per matched element and handles both shapes:
 *   1. Share-price chart: <iframe class="c-iframe" src="https://charts3.equitystory.com/...">
 *   2. Flockler social feed: <div class="flockler-integration"> whose embed id lives on
 *      <div id="flockler-embed-{id}"> (no clean feed URL is rendered, so the canonical
 *      Flockler embed URL is reconstructed from the embed id).
 *
 * Library structure (Embed): 1 column, 2 rows. Row 1 = block name.
 *   Row 2: single cell — optional poster image ABOVE the external content URL.
 *
 * xwalk field hints (per hinting.md): <!-- field:embed_placeholder --> before an optional
 * poster image, then <!-- field:embed_uri --> before the URL link. Both share the "embed_"
 * prefix, so they are grouped into the same cell. embed_placeholderAlt is a collapsed field
 * (rendered as the img alt attribute), so it gets no hint of its own.
 */
export default function parse(element, { document }) {
  // --- Resolve the external content URL (embed_uri) ---
  let uri = null;

  // Case 1: the matched element IS an iframe, or contains one (chart widget).
  const iframe = element.matches && element.matches('iframe')
    ? element
    : element.querySelector('iframe');
  if (iframe) {
    uri = iframe.getAttribute('src')
      || iframe.getAttribute('data-src')
      || iframe.getAttribute('data-gdpr-source');
  }

  // Case 2: Flockler social feed. No feed URL is rendered in the DOM — only the embed id
  // on <div id="flockler-embed-{id}"> (or a data-flockler-embed-id attribute). Reconstruct
  // the canonical Flockler embed script URL from that id.
  if (!uri) {
    const flocklerEmbed = element.querySelector('[id^="flockler-embed-"]');
    let embedId = flocklerEmbed
      ? flocklerEmbed.id.replace('flockler-embed-', '')
      : null;
    if (!embedId) {
      const withId = element.querySelector('[data-flockler-embed-id]')
        || (element.getAttribute && element.getAttribute('data-flockler-embed-id') ? element : null);
      if (withId) embedId = withId.getAttribute('data-flockler-embed-id');
    }
    if (embedId) {
      uri = `https://plugins.flockler.com/embed/${embedId}`;
    }
  }

  // Empty-block guard: no external content URL could be resolved.
  if (!uri) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Optional poster image (embed_placeholder) ---
  // Only a real content poster counts; Flockler renders decorative/inline data-URI SVGs
  // and remote post thumbnails, which are not authored poster images, so ignore them.
  let poster = null;
  const candidateImg = element.querySelector('img');
  if (candidateImg) {
    const src = candidateImg.getAttribute('src') || '';
    const isDataUri = src.startsWith('data:');
    const isFlocklerMedia = /flockler|media-api/.test(src) || candidateImg.closest('.flockler-integration');
    if (!isDataUri && !isFlocklerMedia) {
      poster = candidateImg;
    }
  }

  // Build the single content cell: poster (optional) above the URL link, sharing the embed_ group.
  const contentCell = document.createDocumentFragment();

  if (poster) {
    contentCell.appendChild(document.createComment(' field:embed_placeholder '));
    contentCell.appendChild(poster);
  }

  contentCell.appendChild(document.createComment(' field:embed_uri '));
  const link = document.createElement('a');
  link.setAttribute('href', uri);
  link.textContent = uri;
  contentCell.appendChild(link);

  const cells = [[contentCell]]; // 1-column embed: one row, one cell.

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-widget', cells });
  element.replaceWith(block);
}
