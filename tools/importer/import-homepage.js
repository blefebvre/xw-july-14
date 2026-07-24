/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import carouselNewsParser from './parsers/carousel-news.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import embedWidgetParser from './parsers/embed-widget.js';
import cardsTeaserParser from './parsers/cards-teaser.js';

// TRANSFORMER IMPORTS
import allianzCleanupTransformer from './transformers/allianz-cleanup.js';
import allianzSectionsTransformer from './transformers/allianz-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'carousel-news': carouselNewsParser,
  'columns-feature': columnsFeatureParser,
  'embed-widget': embedWidgetParser,
  'cards-teaser': cardsTeaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description:
    "Allianz Group corporate homepage: hero stage with promotional banner, a news carousel (3-up), investor relations / media center feature blocks with share-price widget, an 'Insights & Specials' multi-column feature grid, an 'Allianz at a glance' stats section, a careers teaser, a social media feed section, and a market-finder CTA.",
  urls: ['https://www.allianz.com/en.html'],
  blocks: [
    {
      name: 'hero-banner',
      instances: [
        '#onemarketing-main-wrapper > div.stage.container.aem-GridColumn.aem-GridColumn--default--12 > div.c-stage',
      ],
    },
    {
      name: 'carousel-news',
      instances: [
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.carousel.container',
      ],
    },
    {
      name: 'columns-feature',
      instances: [
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(2) div.c-wrapper > div.multi-column-grid:nth-of-type(2)',
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(4) div.c-wrapper > div.multi-column-grid',
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(5) div.c-wrapper > div.multi-column-grid',
      ],
    },
    {
      name: 'embed-widget',
      instances: [
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(2) iframe.c-iframe',
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(6) div.flockler-integration',
      ],
    },
    {
      name: 'cards-teaser',
      instances: [
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(3) div.c-wrapper > div.wrapper.container',
      ],
    },
    {
      name: 'section-dark',
      section: 'dark',
      // :last-of-type (not :nth-of-type(7)) because the section transformer runs
      // AFTER the block parsers, which replace div.carousel.container with a <table>.
      // That shifts every following div's :nth-of-type index down by one, so a
      // positional selector would miss. The dark band is always the last wrapper.
      instances: [
        '#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:last-of-type',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, then section boundaries/metadata.
// allianz-sections self-gates on blocks[].section, so it is always registered.
const transformers = [
  allianzCleanupTransformer,
  allianzSectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform (typically document.body)
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Section entries (name starting with "section-") are handled by the section
 * transformer, not by a parser, so they are skipped here.
 * @param {Document} document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    if (blockDef.name.startsWith('section-')) return; // section metadata, not a parser
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    //    Skip elements already replaced by a prior parser (detached from DOM).
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (localized path, no extension)
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
