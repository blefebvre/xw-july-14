/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Allianz Group site-wide cleanup.
 *
 * All selectors below were verified against migration-work/cleaned.html AND the
 * Bright Data validation snapshot (tools/importer/bd-snapshots/en.html.html) for
 * the Allianz homepage (https://www.allianz.com/en.html). No selectors are guessed.
 *
 * Non-authorable content removed (auto-populated by EDS at runtime, or pure
 * site chrome / consent tooling an author never edits):
 *  - Cookie consent overlay          : #onetrust-consent-sdk (cleaned.html line 2882)
 *  - Full-page click-shield overlay  : #overlay              (cleaned.html line 2)
 *  - Global header container         : .header_container.header-container
 *                                      (cleaned.html line 6; contains <header class="c-header">
 *                                       + nav + skip-links + search opener — all EDS-owned)
 *  - Global footer wrapper           : #onemarketing-footer-wrapper
 *                                      (cleaned.html line 2617; wraps <footer class="c-footer">)
 *
 * The authorable content lives under <main id="onemarketing-main-wrapper"> (the
 * hero stage, news carousel, IR/media panels, insights grid, stats, careers,
 * social feed, and the "Find us in your market" dark band). It is left untouched.
 *
 * IMPORTANT — iframes are NOT blanket-removed. The share-price chart
 * (iframe#iframe59923899, cleaned.html line 1663) is an AUTHORABLE embed inside
 * <main> (section 3, mapped to the embed-widget block). The only noise iframe is
 * the OneTrust text-resize helper (iframe.ot-text-resize, line 3174), which lives
 * inside #onetrust-consent-sdk and is therefore already removed with that subtree.
 * A global `iframe` removal here would destroy the authorable chart embed.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Consent SDK + full-page overlay. Removed early so their markup/z-index
    // shells cannot interfere with block parsing. Verified in captured DOM:
    //   #onetrust-consent-sdk  -> cleaned.html line 2882 (also removes the
    //                             nested iframe.ot-text-resize at line 3174)
    //   #overlay               -> cleaned.html line 2
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#overlay',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global header + footer chrome — auto-populated by the EDS header/footer
    // blocks, so an author never creates or edits them on the page. Both live
    // OUTSIDE <main id="onemarketing-main-wrapper"> (verified: 0 header/footer/nav
    // elements inside main), so removing the whole containers is safe and strips
    // the nested <header>, site <nav>, skip-links, and search opener with them.
    //   .header_container.header-container -> cleaned.html line 6
    //   #onemarketing-footer-wrapper       -> cleaned.html line 2617
    WebImporter.DOMUtils.remove(element, [
      '.header_container.header-container',
      '#onemarketing-footer-wrapper',
    ]);

    // Safety net for lingering non-authorable tags. NOTE: 'iframe' is
    // deliberately EXCLUDED — the authorable share-price chart embed
    // (iframe#iframe59923899) sits inside <main>; see file header.
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
    ]);
  }
}
