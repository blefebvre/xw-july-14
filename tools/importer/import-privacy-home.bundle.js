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

  // tools/importer/import-privacy-home.js
  var import_privacy_home_exports = {};
  __export(import_privacy_home_exports, {
    default: () => import_privacy_home_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(".cmp-teaser__image img, .cmp-image__image, img");
    if (bgImage && !bgImage.getAttribute("alt")) {
      const imgTitle = element.querySelector(".cmp-teaser__image-title span[title]");
      if (imgTitle) bgImage.setAttribute("alt", imgTitle.getAttribute("title") || "");
    }
    const heading = element.querySelector(".cmp-teaser__title") || element.querySelector(".cmp-teaser__content h1, .cmp-teaser__content h2, .cmp-teaser__content h3") || element.querySelector("h1, h2");
    const description = element.querySelector(
      ".cmp-teaser__description-text, .cmp-teaser__description"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-container-wrapper a, .cmp-teaser__action a")
    );
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

  // tools/importer/parsers/cards-teaser.js
  function parse2(element, { document }) {
    let cardCols = Array.from(element.querySelectorAll(":scope .cmp-row__col"));
    if (cardCols.length === 0) {
      cardCols = Array.from(element.querySelectorAll(":scope .image")).map((img) => img.parentElement);
    }
    const cells = [];
    cardCols.forEach((col) => {
      const img = col.querySelector(".image img, .cmp-image__image, img");
      const imageCell = document.createDocumentFragment();
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
      const textContainer = col.querySelector(".text .cmp-text, .text, .cmp-text");
      if (textContainer) {
        Array.from(textContainer.childNodes).forEach((node) => {
          textCell.appendChild(node);
        });
      } else {
        const heading = col.querySelector('h1, h2, h3, h4, [class*="title"]');
        const paras = Array.from(col.querySelectorAll("p"));
        if (heading) textCell.appendChild(heading);
        paras.forEach((p) => textCell.appendChild(p));
      }
      if (!img && !textContainer) return;
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/abbvie-privacy-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function removeExperienceFragment(element, modifierClass) {
    element.querySelectorAll(`.cmp-experiencefragment--${modifierClass}`).forEach((xf) => {
      const wrapper = xf.closest(".experiencefragment");
      (wrapper || xf).remove();
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".cmp-globalfooter__onetrust-cookie-panel"
        // OneTrust "Cookies Settings" button panel (line 370)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      removeExperienceFragment(element, "header");
      removeExperienceFragment(element, "footer");
      WebImporter.DOMUtils.remove(element, [
        "footer",
        "iframe",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/import-privacy-home.js
  var PAGE_TEMPLATE = {
    name: "privacy-home",
    description: "AbbVie Privacy Center homepage: category hero teaser, intro paragraph, and a three-up card grid linking to privacy sub-topics.",
    urls: [
      "https://privacy.abbvie/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [
          "#maincontent > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.teaser.cmp-teaser--categoryhero",
          ".teaser.cmp-teaser--categoryhero"
        ]
      },
      {
        name: "cards-teaser",
        instances: [
          "#maincontent > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.row.container.responsivegrid.cmp-row--wider-width",
          ".row.container.responsivegrid.cmp-row--wider-width"
        ]
      }
    ]
  };
  var parsers = {
    "hero-banner": parse,
    "cards-teaser": parse2
  };
  var transformers = [
    transform
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
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
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
  var import_privacy_home_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
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
      let path = new URL(params.originalURL).pathname.replace(/\.html$/, "");
      path = path.replace(/\/$/, "");
      if (path === "") path = "/index";
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
  return __toCommonJS(import_privacy_home_exports);
})();
