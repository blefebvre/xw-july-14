/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-news. Base block: carousel.
 * Variant: carousel-news (xwalk project — container block with carousel-news-item children).
 * Source: https://www.allianz.com/en.html (Allianz Group homepage — 8-slide news carousel).
 * Generated: 2026-07-23
 * Validated against migration-work/block-context/carousel-news/source.html and the
 * Bright Data snapshot (tools/importer/bd-snapshots/en.html.html). Selector matches 1 container;
 * the container holds 8 .swiper-slide elements, each emitted as one 2-cell row.
 *
 * Library structure (Carousel): container block, first row = block name.
 *   Each subsequent row = one slide with 2 cells:
 *     Cell 1: image (mandatory)   -> UE model fields: media_image / media_imageAlt (Alt collapsed into img alt)
 *     Cell 2: rich text (optional) -> UE model field: content_text (Title + Description/date + CTA link)
 *
 * xwalk field hints (per hinting.md): <!-- field:media_image --> before the image cell content,
 * <!-- field:content_text --> before the rich-text cell content. media_imageAlt is a collapsed
 * field (rendered as the img alt attribute), so it gets no hint of its own.
 */
export default function parse(element, { document }) {
  // Each slide is a .swiper-slide (fall back to the teaser wrapper if the swiper class is absent).
  let slides = Array.from(element.querySelectorAll(':scope .swiper-slide'));
  if (slides.length === 0) {
    slides = Array.from(element.querySelectorAll(':scope .c-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // The whole slide is a clickable teaser: <a class="c-teaser__link-area" href aria-label>.
    const linkArea = slide.querySelector('a.c-teaser__link-area, a[class*="link-area"]');

    // --- Image cell (field:media_image) ---
    // Allianz markup: <picture class="c-teaser__image"><img class="c-image__img"></picture>.
    const img = slide.querySelector('.c-teaser__image img, .c-image__img, picture img, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(img);
    }

    // --- Rich-text cell (field:content_text): heading + date/description + CTA ---
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:content_text '));

    // Title styled as a heading.
    const heading = slide.querySelector('.c-carousel__content--teaser h2, .c-carousel__content--teaser h3, h2, h3');
    if (heading) textCell.appendChild(heading);

    // Date + description live in .c-copy (paragraphs or text-aligned divs).
    const copy = slide.querySelector('.c-carousel__text--teaser, .c-copy');
    if (copy) textCell.appendChild(copy);

    // CTA: synthesize an anchor from the teaser link-area so the slide's destination is preserved.
    if (linkArea) {
      const href = linkArea.getAttribute('href');
      if (href) {
        const cta = document.createElement('a');
        cta.setAttribute('href', href);
        const label = (linkArea.getAttribute('aria-label') || '').trim();
        cta.textContent = label || 'Read more';
        textCell.appendChild(cta);
      }
    }

    // Skip a slide only if neither an image nor any text content was found.
    if (!img && !heading && !copy) return;

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-news', cells });
  element.replaceWith(block);
}
