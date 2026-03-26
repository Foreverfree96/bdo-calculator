// BDO Codex recipe scraper with localStorage caching
// Uses codetabs.com CORS proxy to bypass CORS restrictions

const PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';
const CODEX = 'https://bdocodex.com';
const CACHE_KEY = 'bdo_recipe_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Cache helpers ───────────────────────────────────────────────────────────
const getCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch { return {}; }
};

const setCache = (key, data) => {
  const cache = getCache();
  cache[key] = { data, ts: Date.now() };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* full */ }
};

const getCached = (key) => {
  const entry = getCache()[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) return null;
  return entry.data;
};

// ─── Parse recipe HTML from BDO Codex ────────────────────────────────────────
const parseRecipeHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Recipe name
  const nameEl = doc.querySelector('#item_name b');
  const name = nameEl?.textContent?.trim() || 'Unknown';

  // Category (Cooking, Alchemy, etc.)
  const yellowTexts = doc.querySelectorAll('.yellow_text');
  let category = '';
  let skillLevel = '';
  for (const el of yellowTexts) {
    const text = el.textContent.trim();
    if (['Cooking', 'Alchemy', 'Processing', 'Workshop'].includes(text)) {
      category = text;
    }
  }
  // Skill level
  const spans = doc.querySelectorAll('.smallertext span');
  for (const s of spans) {
    if (s.textContent.includes('Skill level:')) {
      skillLevel = s.textContent.replace('Skill level:', '').trim();
    }
  }

  // Materials — look for links with data-id="item--XXXX" in the crafting materials section
  const materials = [];
  const allLinks = doc.querySelectorAll('a[data-id^="item--"]');
  const seenIds = new Set();

  // Find the "Crafting Materials" section
  const craftingHeader = [...doc.querySelectorAll('.yellow_text')].find(el =>
    el.textContent.includes('Crafting Materials')
  );

  if (craftingHeader) {
    // Get the parent cell that contains materials
    const cell = craftingHeader.closest('td');
    if (cell) {
      const matLinks = cell.querySelectorAll('a[data-id^="item--"]');
      for (const link of matLinks) {
        const dataId = link.getAttribute('data-id');
        const itemId = parseInt(dataId.replace('item--', ''), 10);
        if (seenIds.has(itemId)) continue;
        seenIds.add(itemId);

        // Get quantity from the icon wrapper preceding this link
        let qty = 1;
        const wrapper = link.closest('.iconset_wrapper_medium') || link.previousElementSibling;
        if (wrapper) {
          const qtyEl = wrapper.querySelector('.quantity_small');
          if (qtyEl) qty = parseInt(qtyEl.textContent.trim(), 10) || 1;
        }
        // If this link IS inside an icon wrapper, get qty from sibling
        const parentWrapper = link.closest('.iconset_wrapper_medium');
        if (parentWrapper) {
          const qtyEl = parentWrapper.querySelector('.quantity_small');
          if (qtyEl) qty = parseInt(qtyEl.textContent.trim(), 10) || 1;
        }

        // Check if it's a substitutable group (has icon-repeat) or locked (icon_lock)
        const isGroup = !!(parentWrapper?.querySelector('img[alt="group"]'));
        const isLocked = !!(parentWrapper?.querySelector('img[alt="lock"]'));

        // Name from the text link (not the icon link)
        const textLink = [...cell.querySelectorAll(`a[data-id="${dataId}"]`)].find(a => a.textContent.trim());
        const matName = textLink?.textContent?.trim() || `Item #${itemId}`;

        materials.push({ itemId, name: matName, qty, isGroup, isLocked });
      }
    }
  }

  // Crafting results
  const results = [];
  const resultHeader = [...doc.querySelectorAll('.yellow_text')].find(el =>
    el.textContent.includes('Crafting Result')
  );
  if (resultHeader) {
    const cell = resultHeader.closest('td');
    if (cell) {
      const resLinks = cell.querySelectorAll('a[data-id^="item--"]');
      const resSeen = new Set();
      for (const link of resLinks) {
        const dataId = link.getAttribute('data-id');
        const itemId = parseInt(dataId.replace('item--', ''), 10);
        if (resSeen.has(itemId)) continue;
        resSeen.add(itemId);
        const parentWrapper = link.closest('.iconset_wrapper_medium');
        const qtyEl = parentWrapper?.querySelector('.quantity_small');
        const qtyText = qtyEl?.textContent?.trim() || '1';
        const textLink = [...cell.querySelectorAll(`a[data-id="${dataId}"]`)].find(a => a.textContent.trim());
        results.push({
          itemId,
          name: textLink?.textContent?.trim() || `Item #${itemId}`,
          qty: qtyText,
        });
      }
    }
  }

  return { name, category, skillLevel, materials, results };
};

// ─── Search recipes on BDO Codex ─────────────────────────────────────────────
/**
 * Search for recipes by name.
 * @param {string} query
 * @returns {Promise<Array<{id: number, name: string, category: string}>>}
 */
export const searchRecipes = async (query) => {
  if (!query || query.length < 2) return [];

  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${CODEX}/query.php?a=recipes&l=us&q=${encodeURIComponent(query)}`;
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
    if (!res.ok) return [];
    const data = await res.json();

    const recipes = (data.aaData || []).map(row => {
      // row[0] = recipe ID, row[2] = HTML with name, row[3] = category
      const id = row[0];
      // Extract name from HTML
      const nameMatch = row[2]?.match(/<b>(.+?)<\/b>/);
      const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : `Recipe #${id}`;
      const category = row[3] || '';
      return { id, name, category };
    });

    setCache(cacheKey, recipes);
    return recipes;
  } catch (err) {
    console.warn('Recipe search failed:', err.message);
    return [];
  }
};

// ─── Fetch full recipe details ───────────────────────────────────────────────
/**
 * Get full recipe with materials and results.
 * @param {number} recipeId - BDO Codex recipe ID
 * @returns {Promise<Object|null>}
 */
export const fetchRecipe = async (recipeId) => {
  const cacheKey = `recipe_${recipeId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${CODEX}/tip.php?id=recipe--${recipeId}&l=us&nf=on`;
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const html = await res.text();
    const recipe = parseRecipeHtml(html);
    recipe.id = recipeId;
    setCache(cacheKey, recipe);
    return recipe;
  } catch (err) {
    console.warn('Recipe fetch failed:', err.message);
    return null;
  }
};
