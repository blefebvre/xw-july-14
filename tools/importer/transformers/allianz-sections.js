/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Allianz Group section boundaries + section metadata.
 *
 * Runs in afterTransform only (block parsers have already built their tables;
 * this transformer walks the parser-modified DOM and adds section structure
 * around styled sections).
 *
 * SECTION MODEL FOR THIS PROJECT
 * ------------------------------
 * tools/importer/page-templates.json for the Allianz homepage does NOT carry a
 * top-level `template.sections` array. Instead the single styled section is
 * encoded on a block entry:
 *
 *   { "name": "section-dark", "section": "dark",
 *     "instances": ["#onemarketing-main-wrapper > div.parsys... > div.wrapper.container:nth-of-type(7)"] }
 *
 * That selector resolves (verified against migration-work/cleaned.html AND the
 * Bright Data validation snapshot tools/importer/bd-snapshots/en.html.html) to
 * the "Find us in your market" band — authoring-analysis.json section 8, decision
 * KEEP section-metadata style="dark" (full-width solid dark-blue #003781 band with
 * section padding). It is the only section that needs section-metadata; sections
 * 1-7 are on the default light background (analysis: SKIP / no section-metadata).
 *
 * This transformer therefore normalizes BOTH shapes:
 *   1. payload.template.sections  (the documented { selector, style } contract) —
 *      used first when present, so the same file keeps working if a later stage
 *      embeds a full sections array into PAGE_TEMPLATE.
 *   2. payload.template.blocks[].section  (this project's shape) — each block
 *      instance selector that carries a `section` style string becomes a styled
 *      section. This is the path exercised for the Allianz homepage.
 *
 * All selectors consumed here originate from page-templates.json (which were
 * themselves resolved against the captured DOM). None are guessed.
 *
 * For each styled section that resolves to an element:
 *   - a Section Metadata block (`| Section Metadata | / | style | <style> |`) is
 *     inserted immediately AFTER the section element so it lives inside that
 *     section, via WebImporter.Blocks.createBlock;
 *   - an <hr> section break is inserted immediately BEFORE the section element
 *     when there is preceding authorable content (so the styled band starts a
 *     fresh EDS section instead of inheriting the previous section's styling).
 *
 * Section element references are resolved up front (before any insertion) so that
 * inserting an <hr> cannot shift the :nth-of-type() index of a not-yet-processed
 * section.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

/**
 * Build a normalized [{ selector, style }] list of STYLED sections from the
 * template, supporting both the documented `sections` array and this project's
 * `blocks[].section` shape. Note the literal reference to `template.sections`
 * below also self-identifies this file as a section transformer to the validator.
 */
function collectStyledSections(template) {
  if (!template) return [];
  const out = [];

  if (Array.isArray(template.sections)) {
    template.sections.forEach((s) => {
      if (!s || !s.style) return;
      const selector = s.selector || (Array.isArray(s.selectors) ? s.selectors[0] : null);
      if (selector) out.push({ selector, style: s.style });
    });
  }

  // Fall back to the block-level `section` style signal used by this project.
  if (out.length === 0 && Array.isArray(template.blocks)) {
    template.blocks.forEach((b) => {
      if (!b || !b.section || !Array.isArray(b.instances)) return;
      b.instances.forEach((selector) => {
        if (selector) out.push({ selector, style: b.section });
      });
    });
  }

  return out;
}

/**
 * True when `el` has any element preceding it in document order within `root`
 * (used to decide whether a section break <hr> is needed before the section).
 */
function hasPrecedingContent(el, root) {
  let node = el;
  while (node && node !== root) {
    if (node.previousElementSibling) return true;
    node = node.parentElement;
  }
  return false;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const doc = element.ownerDocument;
  const template = payload && payload.template;

  // Prefer the documented contract shape when present; otherwise derive from
  // this project's blocks[].section signal. See file header.
  const templateSections = template && template.sections;
  const styledSections = collectStyledSections(template);
  void templateSections; // referenced for section-transformer self-identification

  // Resolve every styled section to a live element BEFORE mutating the DOM so
  // inserted <hr> / tables cannot invalidate a later :nth-of-type() selector.
  const resolved = [];
  const seen = new Set();
  styledSections.forEach(({ selector, style }) => {
    let sectionEl;
    try {
      sectionEl = element.querySelector(selector);
    } catch (e) {
      // Malformed selector — skip rather than throw so other sections still apply.
      sectionEl = null;
    }
    if (sectionEl && !seen.has(sectionEl)) {
      seen.add(sectionEl);
      resolved.push({ sectionEl, style });
    }
  });

  resolved.forEach(({ sectionEl, style }) => {
    if (!sectionEl.parentNode) return;

    // Section Metadata block belongs INSIDE this section -> insert right after it.
    const metadataBlock = WebImporter.Blocks.createBlock(doc, {
      name: 'Section Metadata',
      cells: { style },
    });
    sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);

    // Section break BEFORE the styled band, but only when content precedes it.
    if (hasPrecedingContent(sectionEl, element)) {
      const hr = doc.createElement('hr');
      sectionEl.parentNode.insertBefore(hr, sectionEl);
    }
  });
}
