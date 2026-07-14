/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie Privacy Center site-wide cleanup.
 *
 * All selectors below were verified against migration-work/cleaned.html for the
 * privacy.abbvie homepage. No selectors are guessed.
 *
 * Non-authorable content removed:
 *  - Global header experience fragment  (.experiencefragment > .cmp-experiencefragment--header, line 4-5)
 *  - Global footer experience fragment  (.experiencefragment > .cmp-experiencefragment--footer, line 299-300)
 *    Both are auto-populated at runtime by the EDS header/footer blocks.
 *  - OneTrust cookie consent SDK overlay (#onetrust-consent-sdk, line 545) and the
 *    OneTrust settings button panel inside the footer (line 370).
 *
 * The authorable content (<main id="maincontent"> with the category hero teaser and
 * three-up card grid, lines 176-298) is left untouched.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Remove the full .experiencefragment wrapper for a given XF modifier class so the
// entire fragment (not just its inner content) is stripped.
function removeExperienceFragment(element, modifierClass) {
  element.querySelectorAll(`.cmp-experiencefragment--${modifierClass}`).forEach((xf) => {
    const wrapper = xf.closest('.experiencefragment');
    (wrapper || xf).remove();
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent SDK overlay/banner — verified: #onetrust-consent-sdk (line 545).
    // Removed early so the overlay markup cannot interfere with block parsing.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.cmp-globalfooter__onetrust-cookie-panel', // OneTrust "Cookies Settings" button panel (line 370)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global header / footer experience fragments — auto-populated by EDS header/footer blocks.
    // Verified: .cmp-experiencefragment--header (line 5), .cmp-experiencefragment--footer (line 300).
    removeExperienceFragment(element, 'header');
    removeExperienceFragment(element, 'footer');

    // Any lingering standalone footer chrome, safety net for non-authorable tags.
    WebImporter.DOMUtils.remove(element, [
      'footer',
      'iframe',
      'noscript',
      'link',
    ]);
  }
}
