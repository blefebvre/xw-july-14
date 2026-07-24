/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(
      ".c-stage__image img, .c-image__img, picture img, img"
    );
    const heading = element.querySelector(
      ".headline h1, .headline h2, .c-stage__content h1, .c-stage__content h2, h1, h2"
    );
    const description = element.querySelector(".c-stage__content .c-copy, .c-copy");
    const ctaLinks = Array.from(
      element.querySelectorAll(".button a.c-button, a.c-button")
    ).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !description && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(bgImage);
      cells.push([imageCell]);
    }
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(" field:text "));
    if (heading) contentCell.appendChild(heading);
    if (description) contentCell.appendChild(description);
    ctaLinks.forEach((cta) => contentCell.appendChild(cta));
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-news.js
  function parse2(element, { document }) {
    let slides = Array.from(element.querySelectorAll(":scope .swiper-slide"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll(":scope .c-teaser"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const linkArea = slide.querySelector('a.c-teaser__link-area, a[class*="link-area"]');
      const img = slide.querySelector(".c-teaser__image img, .c-image__img, picture img, img");
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:media_image "));
        imageCell.appendChild(img);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:content_text "));
      const heading = slide.querySelector(".c-carousel__content--teaser h2, .c-carousel__content--teaser h3, h2, h3");
      if (heading) textCell.appendChild(heading);
      const copy = slide.querySelector(".c-carousel__text--teaser, .c-copy");
      if (copy) textCell.appendChild(copy);
      if (linkArea) {
        const href = linkArea.getAttribute("href");
        if (href) {
          const cta = document.createElement("a");
          cta.setAttribute("href", href);
          const label = (linkArea.getAttribute("aria-label") || "").trim();
          cta.textContent = label || "Read more";
          textCell.appendChild(cta);
        }
      }
      if (!img && !heading && !copy) return;
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse3(element, { document }) {
    const row = element.querySelector(":scope > div > .l-grid__row") || element.querySelector(".l-grid__row");
    const columns = row ? Array.from(row.children).filter((c) => c.classList && c.classList.contains("column")) : [];
    const cellContents = columns.map((col) => {
      const parts = [];
      Array.from(col.children).forEach((child) => {
        if (child.classList && child.classList.contains("spacer") && !child.textContent.trim() && !child.querySelector("img, iframe, a")) {
          return;
        }
        parts.push(child);
      });
      return parts;
    });
    const nonEmpty = cellContents.filter((parts) => parts.length > 0 && parts.some((el) => el.textContent.trim() || el.querySelector("img, iframe, a")));
    if (columns.length === 0 || nonEmpty.length < 2) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const columnRow = cellContents.map((parts) => parts.length ? parts : "");
    const cells = [columnRow];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-widget.js
  function parse4(element, { document }) {
    let uri = null;
    const iframe = element.matches && element.matches("iframe") ? element : element.querySelector("iframe");
    if (iframe) {
      uri = iframe.getAttribute("src") || iframe.getAttribute("data-src") || iframe.getAttribute("data-gdpr-source");
    }
    if (!uri) {
      const flocklerEmbed = element.querySelector('[id^="flockler-embed-"]');
      let embedId = flocklerEmbed ? flocklerEmbed.id.replace("flockler-embed-", "") : null;
      if (!embedId) {
        const withId = element.querySelector("[data-flockler-embed-id]") || (element.getAttribute && element.getAttribute("data-flockler-embed-id") ? element : null);
        if (withId) embedId = withId.getAttribute("data-flockler-embed-id");
      }
      if (embedId) {
        uri = `https://plugins.flockler.com/embed/${embedId}`;
      }
    }
    if (!uri) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let poster = null;
    const candidateImg = element.querySelector("img");
    if (candidateImg) {
      const src = candidateImg.getAttribute("src") || "";
      const isDataUri = src.startsWith("data:");
      const isFlocklerMedia = /flockler|media-api/.test(src) || candidateImg.closest(".flockler-integration");
      if (!isDataUri && !isFlocklerMedia) {
        poster = candidateImg;
      }
    }
    const contentCell = document.createDocumentFragment();
    if (poster) {
      contentCell.appendChild(document.createComment(" field:embed_placeholder "));
      contentCell.appendChild(poster);
    }
    contentCell.appendChild(document.createComment(" field:embed_uri "));
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.textContent = uri;
    contentCell.appendChild(link);
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-widget", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function parse5(element, { document }) {
    const row = element.querySelector(".l-grid__row");
    const columns = row ? Array.from(row.children).filter((c) => c.classList && c.classList.contains("column")) : [];
    let imageCol = columns.find((c) => c.querySelector("img")) || null;
    let textCol = columns.find((c) => c !== imageCol && (c.querySelector("h1, h2, h3, h4, .headline") || c.querySelector(".text, .c-copy, a"))) || columns.find((c) => c !== imageCol) || null;
    const imageCell = document.createDocumentFragment();
    const img = imageCol ? imageCol.querySelector("img") : null;
    if (img) {
      if (!img.getAttribute("alt")) {
        const t = img.getAttribute("title");
        if (t) img.setAttribute("alt", t);
      }
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(img);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    const scope = textCol || element;
    const heading = scope.querySelector(".headline h1, .headline h2, .headline h3, .headline h4, h1, h2, h3, h4");
    if (heading) textCell.appendChild(heading);
    const description = scope.querySelector(".text .c-copy, .c-copy");
    if (description) textCell.appendChild(description);
    const ctaLinks = Array.from(scope.querySelectorAll("a.c-link, a.c-button"));
    ctaLinks.forEach((a) => textCell.appendChild(a));
    if (!img && !heading && !description && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/allianz-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#overlay"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".header_container.header-container",
        "#onemarketing-footer-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/allianz-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
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
  function hasPrecedingContent(el, root) {
    let node = el;
    while (node && node !== root) {
      if (node.previousElementSibling) return true;
      node = node.parentElement;
    }
    return false;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const doc = element.ownerDocument;
    const template = payload && payload.template;
    const templateSections = template && template.sections;
    const styledSections = collectStyledSections(template);
    const resolved = [];
    const seen = /* @__PURE__ */ new Set();
    styledSections.forEach(({ selector, style }) => {
      let sectionEl;
      try {
        sectionEl = element.querySelector(selector);
      } catch (e) {
        sectionEl = null;
      }
      if (sectionEl && !seen.has(sectionEl)) {
        seen.add(sectionEl);
        resolved.push({ sectionEl, style });
      }
    });
    resolved.forEach(({ sectionEl, style }) => {
      if (!sectionEl.parentNode) return;
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: "Section Metadata",
        cells: { style }
      });
      sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
      if (hasPrecedingContent(sectionEl, element)) {
        const hr = doc.createElement("hr");
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    });
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-banner": parse,
    "carousel-news": parse2,
    "columns-feature": parse3,
    "embed-widget": parse4,
    "cards-teaser": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Allianz Group corporate homepage: hero stage with promotional banner, a news carousel (3-up), investor relations / media center feature blocks with share-price widget, an 'Insights & Specials' multi-column feature grid, an 'Allianz at a glance' stats section, a careers teaser, a social media feed section, and a market-finder CTA.",
    urls: ["https://www.allianz.com/en.html"],
    blocks: [
      {
        name: "hero-banner",
        instances: [
          "#onemarketing-main-wrapper > div.stage.container.aem-GridColumn.aem-GridColumn--default--12 > div.c-stage"
        ]
      },
      {
        name: "carousel-news",
        instances: [
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.carousel.container"
        ]
      },
      {
        name: "columns-feature",
        instances: [
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(2) div.c-wrapper > div.multi-column-grid:nth-of-type(2)",
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(4) div.c-wrapper > div.multi-column-grid",
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(5) div.c-wrapper > div.multi-column-grid"
        ]
      },
      {
        name: "embed-widget",
        instances: [
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(2) iframe.c-iframe",
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(6) div.flockler-integration"
        ]
      },
      {
        name: "cards-teaser",
        instances: [
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:nth-of-type(3) div.c-wrapper > div.wrapper.container"
        ]
      },
      {
        name: "section-dark",
        section: "dark",
        // :last-of-type (not :nth-of-type(7)) because the section transformer runs
        // AFTER the block parsers, which replace div.carousel.container with a <table>.
        // That shifts every following div's :nth-of-type index down by one, so a
        // positional selector would miss. The dark band is always the last wrapper.
        instances: [
          "#onemarketing-main-wrapper > div.parsys.aem-GridColumn.aem-GridColumn--default--12 > div.wrapper.container:last-of-type"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (blockDef.name.startsWith("section-")) return;
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
