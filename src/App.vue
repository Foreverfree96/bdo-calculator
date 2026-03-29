<script setup>
import { ref, computed, watch } from 'vue';
import { searchRecipes, fetchRecipe, findRecipeIdByName, preloadRecipeIndex } from './utils/recipes.js';
import { fetchMarketPrice, fetchMarketPrices, searchMarketItems } from './utils/arsha.js';
import { getMasteryBonus, getBoxSellPrice, getBoxLimit, BOX_TIERS } from './utils/imperial.js';
import { TRADING_LEVELS, ALL_TRADE_ITEMS, PICKUP_LOCATIONS, SELL_LOCATIONS, DISTANCE_BONUS, getBargainBonus, getCrateSellPrice } from './utils/trading.js';
import { searchLocalItems, getStaticPrice } from './utils/items.js';
import { PROCESSING_CATEGORIES, PROCESSING_RECIPES } from './utils/processing.js';
import RecipeMaterial from './components/RecipeMaterial.vue';

const tab = ref('marketplace');
const recipeIndexReady = ref(false);

// Pre-load recipe index when Recipes or Crafting tab is opened
watch(tab, (v) => {
  if ((v === 'recipes' || v === 'crafting') && !recipeIndexReady.value) {
    preloadRecipeIndex().then(() => { recipeIndexReady.value = true; });
  }
});

// ─── MARKETPLACE TAX CALCULATOR ──────────────────────────────────────────────
const mp = ref({
  sellPrice: null,
  quantity: 1,
  hasValuePack: true,
});

// Item search
const mpItemQuery = ref('');
const mpItemResults = ref([]);
const mpItemSearching = ref(false);
const mpItemShowDropdown = ref(false);
const mpItemPriceLoading = ref(false);
const mpRegion = ref('na');

let mpSearchTimeout = null;
const onMpItemSearch = () => {
  clearTimeout(mpSearchTimeout);
  if (!mpItemQuery.value || mpItemQuery.value.length < 1) {
    mpItemResults.value = [];
    mpItemShowDropdown.value = false;
    return;
  }
  // Instant local results
  const local = searchLocalItems(mpItemQuery.value).map(i => ({ name: i.name, id: null, cat: i.cat, local: true }));
  mpItemResults.value = local;
  mpItemShowDropdown.value = local.length > 0;
  // Then API
  if (mpItemQuery.value.length >= 2) {
    mpSearchTimeout = setTimeout(async () => {
      mpItemSearching.value = true;
      const api = await searchMarketItems(mpItemQuery.value, mpRegion.value);
      const localNames = new Set(local.map(l => l.name.toLowerCase()));
      mpItemResults.value = [...local, ...api.filter(a => !localNames.has(a.name.toLowerCase()))];
      mpItemShowDropdown.value = mpItemResults.value.length > 0;
      mpItemSearching.value = false;
    }, 400);
  }
};

const selectMpItem = async (item) => {
  mpItemQuery.value = item.name;
  mpItemShowDropdown.value = false;
  mpItemPriceLoading.value = true;
  const price = await resolveItem(item, mpRegion.value);
  if (price) mp.value.sellPrice = price;
  mpItemPriceLoading.value = false;
};

const clearMpItem = () => {
  mpItemQuery.value = '';
  mpItemResults.value = [];
  mpItemShowDropdown.value = false;
  mp.value.sellPrice = null;
};
const hideMpDropdown = () => setTimeout(() => { mpItemShowDropdown.value = false; }, 150);

const mpTaxRate = computed(() => mp.value.hasValuePack ? 0.155 : 0.35);
const mpTaxLabel = computed(() => mp.value.hasValuePack ? '15.5%' : '35%');
const mpRevenue = computed(() => {
  const price = mp.value.sellPrice || 0;
  const qty = mp.value.quantity || 1;
  return Math.floor(price * (1 - mpTaxRate.value)) * qty;
});
const mpTaxAmount = computed(() => {
  const price = mp.value.sellPrice || 0;
  const qty = mp.value.quantity || 1;
  return Math.floor(price * mpTaxRate.value) * qty;
});

// ─── ITEM SEARCH HELPER (reusable across tabs) ──────────────────────────────
const itemSearchState = () => ({
  query: '', results: [], searching: false, showDropdown: false, priceLoading: false, timeout: null,
});

const doItemSearch = (state, region) => {
  clearTimeout(state.timeout);
  if (!state.query || state.query.length < 1) { state.results = []; state.showDropdown = false; return; }
  // Instant local results with price hints
  const local = searchLocalItems(state.query).map(i => ({ name: i.name, id: null, cat: i.cat, priceHint: i.priceHint, local: true }));
  state.results = local;
  state.showDropdown = local.length > 0;
  // Then fetch API results + live prices after delay
  if (state.query.length >= 2) {
    state.timeout = setTimeout(async () => {
      state.searching = true;
      const api = await searchMarketItems(state.query, region);
      const localNames = new Set(local.map(l => l.name.toLowerCase()));
      const apiNew = api.filter(a => !localNames.has(a.name.toLowerCase()));
      const merged = [...local, ...apiNew];
      state.results = merged;
      state.showDropdown = merged.length > 0;
      state.searching = false;
      // Fetch live prices for all results in background
      const toFetch = merged.filter(i => i.id);
      if (toFetch.length > 0) {
        const ids = toFetch.map(i => i.id);
        const prices = await fetchMarketPrices(ids, region);
        for (const item of merged) {
          if (item.id && prices.has(item.id)) {
            item.livePrice = prices.get(item.id).price;
            item.priceHint = fmtSilver(prices.get(item.id).price);
          }
        }
        state.results = [...merged]; // trigger reactivity
      }
      // Also resolve prices for local items that matched API names
      for (const item of merged) {
        if (item.local && !item.livePrice) {
          const apiMatch = api.find(a => a.name.toLowerCase() === item.name.toLowerCase());
          if (apiMatch?.id) {
            item.id = apiMatch.id;
            const data = await fetchMarketPrice(apiMatch.id, region);
            if (data?.price) {
              item.livePrice = data.price;
              item.priceHint = fmtSilver(data.price);
            }
          }
        }
      }
      state.results = [...merged]; // trigger reactivity again
    }, 400);
  }
};

const fmtSilver = (p) => {
  if (p >= 1_000_000_000) return (p / 1_000_000_000).toFixed(1) + 'B';
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + 'M';
  if (p >= 1_000) return (p / 1_000).toFixed(1) + 'K';
  return p.toString();
};

const hideDropdown = (state) => setTimeout(() => { state.showDropdown = false; }, 150);

// Resolve a local item (no ID) to its market ID + price
const resolveItem = async (item, region) => {
  // Use pre-fetched live price if available
  if (item.livePrice) return item.livePrice;
  // Try by item ID
  if (item.id) {
    try {
      const data = await fetchMarketPrice(item.id, region);
      if (data?.price) return data.price;
    } catch { /* continue */ }
  }
  // Try marketplace name search
  try {
    const results = await searchMarketItems(item.name, region);
    const match = results.find(r => r.name.toLowerCase() === item.name.toLowerCase()) || results[0];
    if (match?.id) {
      const data = await fetchMarketPrice(match.id, region);
      if (data?.price) return data.price;
    }
  } catch { /* continue */ }
  // Fallback to static price
  if (item.price) return item.price;
  return getStaticPrice(item.name);
};

// ─── CRAFTING ROI CALCULATOR ─────────────────────────────────────────────────
const craft = ref({
  sellPrice: null,
  hasValuePack: true,
  materials: [{ name: '', cost: null, qty: 1, gathered: false, hasRecipe: false, subMaterials: [], showSubs: false }],
  craftsPerSession: 1,
});
const craftRegion = ref('na');

// Crafting finished item search
const craftItemSearch = ref(itemSearchState());
const onCraftItemSearch = () => doItemSearch(craftItemSearch.value, craftRegion.value);
const craftLoadingRecipe = ref(false);
const selectCraftItem = async (item) => {
  craftItemSearch.value.query = item.name;
  craftItemSearch.value.showDropdown = false;
  craftItemSearch.value.priceLoading = true;
  // Fetch sell price
  const price = await resolveItem(item, craftRegion.value);
  if (price) craft.value.sellPrice = price;
  craftItemSearch.value.priceLoading = false;
  // Auto-load recipe materials
  craftLoadingRecipe.value = true;
  try {
    const recipeId = await findRecipeIdByName(item.name);
    if (recipeId) {
      const recipe = await fetchRecipe(recipeId);
      if (recipe?.materials?.length) {
        // Reset materials and search states
        matSearchStates.value = {};
        craft.value.materials = recipe.materials.map(m => ({
          name: m.name,
          cost: null,
          qty: m.qty || 1,
          gathered: false,
          hasRecipe: !!m.hasRecipe,
          subMaterials: [],
          showSubs: false,
          itemId: m.itemId || null,
        }));
        // Set search state queries for each material
        recipe.materials.forEach((m, i) => {
          const s = getMatSearch(i);
          s.query = m.name;
        });
        // Helper: try all price sources for a material
        const region = craftRegion.value;
        const fetchMatPrice = async (name, itemId) => {
          // 1. Try by item ID (market + NPC vendor)
          if (itemId) {
            try {
              const data = await fetchMarketPrice(itemId, region);
              if (data?.price) return data.price;
            } catch { /* continue */ }
          }
          // 2. Try marketplace name search
          try {
            const results = await searchMarketItems(name, region);
            const match = results.find(r => r.name.toLowerCase() === name.toLowerCase()) || results[0];
            if (match?.id) {
              const data = await fetchMarketPrice(match.id, region);
              if (data?.price) return data.price;
            }
          } catch { /* continue */ }
          // 3. Fallback to static price from COMMON_ITEMS
          return getStaticPrice(name);
        };

        // Fetch live prices + sub-recipes in parallel
        await Promise.all(recipe.materials.map(async (m, i) => {
          try {
            const price = await fetchMatPrice(m.name, m.itemId);
            if (price) craft.value.materials[i].cost = price;
            // Fetch sub-recipe if this material is craftable
            if (m.hasRecipe) {
              const subId = await findRecipeIdByName(m.name);
              if (subId) {
                const subRecipe = await fetchRecipe(subId);
                if (subRecipe?.materials?.length) {
                  const subs = await Promise.all(subRecipe.materials.map(async (sm) => {
                    const subPrice = await fetchMatPrice(sm.name, sm.itemId);
                    return { name: sm.name, qty: sm.qty || 1, cost: subPrice, gathered: false };
                  }));
                  craft.value.materials[i].subMaterials = subs;
                }
              }
            }
          } catch { /* skip */ }
        }));
      }
    }
  } catch { /* recipe lookup failed, no big deal */ }
  craftLoadingRecipe.value = false;
};

// Material search — per-material search states
const matSearchStates = ref({});
const getMatSearch = (i) => {
  if (!matSearchStates.value[i]) matSearchStates.value[i] = itemSearchState();
  return matSearchStates.value[i];
};
const onMatSearch = (i) => doItemSearch(getMatSearch(i), craftRegion.value);
const selectMatItem = async (i, item) => {
  const s = getMatSearch(i);
  s.query = item.name;
  s.showDropdown = false;
  craft.value.materials[i].name = item.name;
  s.priceLoading = true;
  const price = await resolveItem(item, craftRegion.value);
  if (price) craft.value.materials[i].cost = price;
  s.priceLoading = false;
};

const addMaterial = () => craft.value.materials.push({ name: '', cost: null, qty: 1, gathered: false, hasRecipe: false, subMaterials: [], showSubs: false, itemId: null });
const toggleGathered = (m) => { m.gathered = !m.gathered; };
const toggleSubGathered = (sub) => { sub.gathered = !sub.gathered; };
const removeMaterial = (i) => {
  craft.value.materials.splice(i, 1);
  delete matSearchStates.value[i];
  // Re-index
  const updated = {};
  Object.keys(matSearchStates.value).forEach(k => {
    const ki = Number(k);
    if (ki > i) updated[ki - 1] = matSearchStates.value[k];
    else if (ki < i) updated[ki] = matSearchStates.value[k];
  });
  matSearchStates.value = updated;
};

const craftTotalMaterialCost = computed(() =>
  craft.value.materials.reduce((sum, m) => {
    if (m.gathered) return sum;
    // If has sub-materials and expanded, use sub-material costs instead
    if (m.showSubs && m.subMaterials.length) {
      const subCost = m.subMaterials.reduce((s, sm) => s + (sm.gathered ? 0 : (sm.cost || 0) * (sm.qty || 1)), 0);
      return sum + subCost * (m.qty || 1);
    }
    return sum + (m.cost || 0) * (m.qty || 1);
  }, 0)
);
const craftTaxRate = computed(() => craft.value.hasValuePack ? 0.155 : 0.35);
const craftRevenuePerItem = computed(() =>
  Math.floor((craft.value.sellPrice || 0) * (1 - craftTaxRate.value))
);
const craftProfitPerItem = computed(() => craftRevenuePerItem.value - craftTotalMaterialCost.value);
const craftProfitPerSession = computed(() => craftProfitPerItem.value * (craft.value.craftsPerSession || 1));
const craftROI = computed(() => {
  if (!craftTotalMaterialCost.value) return 0;
  return ((craftProfitPerItem.value / craftTotalMaterialCost.value) * 100).toFixed(1);
});

// ─── ENHANCEMENT ROI CALCULATOR ──────────────────────────────────────────────
const enhance = ref({
  baseItemCost: null,
  targetSellPrice: null,
  hasValuePack: true,
  successRate: null,
  failstackCost: null,
  cronStoneCost: null,
  cronStonesNeeded: 0,
  repairCost: null,
  attemptsToSimulate: 10,
});
const enhRegion = ref('na');

// Enhancement base item search
const enhBaseSearch = ref(itemSearchState());
const onEnhBaseSearch = () => doItemSearch(enhBaseSearch.value, enhRegion.value);
const selectEnhBase = async (item) => {
  enhBaseSearch.value.query = item.name;
  enhBaseSearch.value.showDropdown = false;
  enhBaseSearch.value.priceLoading = true;
  const price = await resolveItem(item, enhRegion.value);
  if (price) enhance.value.baseItemCost = price;
  enhBaseSearch.value.priceLoading = false;
  // Auto-fill cron stone + memory fragment costs if not set
  if (!enhance.value.cronStoneCost) {
    fetchMarketPrice(16004, enhRegion.value).then(d => {
      if (d?.price && !enhance.value.cronStoneCost) enhance.value.cronStoneCost = d.price;
    });
  }
  if (!enhance.value.repairCost) {
    fetchMarketPrice(44195, enhRegion.value).then(d => {
      if (d?.price && !enhance.value.repairCost) enhance.value.repairCost = d.price;
    });
  }
};

// Enhancement target item search
const enhTargetSearch = ref(itemSearchState());
const onEnhTargetSearch = () => doItemSearch(enhTargetSearch.value, enhRegion.value);
const selectEnhTarget = async (item) => {
  enhTargetSearch.value.query = item.name;
  enhTargetSearch.value.showDropdown = false;
  enhTargetSearch.value.priceLoading = true;
  const price = await resolveItem(item, enhRegion.value);
  if (price) enhance.value.targetSellPrice = price;
  enhTargetSearch.value.priceLoading = false;
};

const enhTaxRate = computed(() => enhance.value.hasValuePack ? 0.155 : 0.35);
const enhSuccessDecimal = computed(() => (enhance.value.successRate || 0) / 100);
const enhCostPerAttempt = computed(() => {
  const fs = enhance.value.failstackCost || 0;
  const cron = (enhance.value.cronStoneCost || 0) * (enhance.value.cronStonesNeeded || 0);
  return fs + cron;
});
const enhRepairOnFail = computed(() => enhance.value.repairCost || 0);
const enhExpectedAttempts = computed(() => {
  if (!enhSuccessDecimal.value) return 0;
  return Math.ceil(1 / enhSuccessDecimal.value);
});
const enhExpectedTotalCost = computed(() => {
  const attempts = enhExpectedAttempts.value;
  const fails = Math.max(0, attempts - 1);
  return (enhance.value.baseItemCost || 0)
    + (enhCostPerAttempt.value * attempts)
    + (enhRepairOnFail.value * fails);
});
const enhSellRevenue = computed(() =>
  Math.floor((enhance.value.targetSellPrice || 0) * (1 - enhTaxRate.value))
);
const enhExpectedProfit = computed(() => enhSellRevenue.value - enhExpectedTotalCost.value);
const enhROI = computed(() => {
  if (!enhExpectedTotalCost.value) return 0;
  return ((enhExpectedProfit.value / enhExpectedTotalCost.value) * 100).toFixed(1);
});

const enhSimRows = computed(() => {
  const rows = [];
  let cumulativeCost = enhance.value.baseItemCost || 0;
  for (let i = 1; i <= (enhance.value.attemptsToSimulate || 10); i++) {
    cumulativeCost += enhCostPerAttempt.value;
    if (i > 1) cumulativeCost += enhRepairOnFail.value;
    const cumulativeSuccessRate = 1 - Math.pow(1 - enhSuccessDecimal.value, i);
    const profit = enhSellRevenue.value - cumulativeCost;
    rows.push({
      attempt: i,
      cumulativeCost,
      cumulativeSuccessRate: (cumulativeSuccessRate * 100).toFixed(1),
      profit,
    });
  }
  return rows;
});

// ─── RECIPE LOOKUP ───────────────────────────────────────────────────────────
const recipeQuery = ref('');
const recipeResults = ref([]);
const recipeSearching = ref(false);
const selectedRecipe = ref(null);
const recipeLoading = ref(false);
const recipeRegion = ref('na');
const recipeHasValuePack = ref(true);
const recipePricesLoading = ref(false);
const recipeError = ref('');
const showRecipeDropdown = ref(false);

// Material state: keyed by itemId → { source: 'market'|'gathered', price, priceLoading }
const materialState = ref({});

let searchTimeout = null;
const onRecipeSearch = () => {
  clearTimeout(searchTimeout);
  if (!recipeQuery.value || recipeQuery.value.length < 2) {
    recipeResults.value = [];
    showRecipeDropdown.value = false;
    return;
  }
  searchTimeout = setTimeout(async () => {
    recipeSearching.value = true;
    recipeError.value = '';
    try {
      recipeResults.value = await searchRecipes(recipeQuery.value);
      showRecipeDropdown.value = recipeResults.value.length > 0;
    } catch { recipeError.value = 'Search failed'; }
    recipeSearching.value = false;
  }, 400);
};

// Helper: init material state + fetch price for an item
const initAndFetchPrice = (itemId) => {
  if (!materialState.value[itemId]) {
    materialState.value[itemId] = { source: 'market', price: null, priceSource: null, priceLoading: true };
  }
  if (materialState.value[itemId].priceLoading || materialState.value[itemId].price == null) {
    materialState.value[itemId].priceLoading = true;
    fetchMarketPrice(itemId, recipeRegion.value).then(data => {
      if (materialState.value[itemId]) {
        materialState.value[itemId].price = data?.price || null;
        materialState.value[itemId].priceSource = data?.source || null;
        materialState.value[itemId].priceLoading = false;
      }
    });
  }
};

// Auto-expand a material's sub-recipe recursively (depth-limited to prevent infinite loops)
const autoExpandSubRecipe = async (material, depth = 0) => {
  if (depth > 5) return; // safety limit
  const key = material.itemId;
  if (subRecipes.value[key]?.recipe) return; // already loaded

  subRecipes.value[key] = { loading: true, recipe: null, expanded: true };
  try {
    const recipeId = await findRecipeIdByName(material.name);
    if (!recipeId) { subRecipes.value[key].loading = false; return; }
    const recipe = await fetchRecipe(recipeId);
    subRecipes.value[key].recipe = recipe;
    subRecipes.value[key].loading = false;

    // Init + fetch prices for all sub-materials
    if (recipe?.materials) {
      for (const sm of recipe.materials) {
        initAndFetchPrice(sm.itemId);
      }
      // Recursively expand any craftable sub-materials
      const craftableSubs = recipe.materials.filter(sm => sm.hasRecipe);
      await Promise.all(craftableSubs.map(sm => autoExpandSubRecipe(sm, depth + 1)));
    }
  } catch {
    subRecipes.value[key].loading = false;
  }
};

const selectRecipe = async (recipe) => {
  showRecipeDropdown.value = false;
  recipeQuery.value = recipe.name;
  recipeLoading.value = true;
  recipeError.value = '';
  selectedRecipe.value = null;
  materialState.value = {};
  subRecipes.value = {};

  try {
    const data = await fetchRecipe(recipe.id);
    if (!data || !data.materials.length) {
      recipeError.value = 'Could not load recipe materials. Try again.';
      recipeLoading.value = false;
      return;
    }
    selectedRecipe.value = data;

    // Init material state for all top-level materials + results
    for (const m of data.materials) initAndFetchPrice(m.itemId);
    for (const r of data.results) initAndFetchPrice(r.itemId);

    recipeLoading.value = false;

    // Auto-expand ALL craftable sub-recipes in parallel
    const craftable = data.materials.filter(m => m.hasRecipe);
    await Promise.all(craftable.map(m => autoExpandSubRecipe(m)));
  } catch (err) {
    recipeError.value = 'Failed to load recipe: ' + (err.message || 'unknown error');
    recipeLoading.value = false;
  }
};

const loadPrices = async () => {
  if (!selectedRecipe.value) return;
  recipePricesLoading.value = true;

  // Collect ALL item IDs — top-level + all sub-recipe materials
  const allIds = new Set();
  for (const m of selectedRecipe.value.materials) allIds.add(m.itemId);
  for (const r of selectedRecipe.value.results) allIds.add(r.itemId);
  for (const sub of Object.values(subRecipes.value)) {
    if (sub.recipe?.materials) {
      for (const sm of sub.recipe.materials) allIds.add(sm.itemId);
    }
  }

  const promises = [...allIds].map(async (id) => {
    if (!materialState.value[id]) {
      materialState.value[id] = { source: 'market', price: null, priceSource: null, priceLoading: true };
    }
    materialState.value[id].priceLoading = true;
    const data = await fetchMarketPrice(id, recipeRegion.value);
    if (materialState.value[id]) {
      materialState.value[id].price = data?.price || null;
      materialState.value[id].priceSource = data?.source || null;
      materialState.value[id].priceLoading = false;
    }
  });

  await Promise.all(promises);
  recipePricesLoading.value = false;
};

// Helper: get cost of a single material (recursive — walks sub-recipe tree)
const getMatCost = (m, depth = 0) => {
  if (depth > 6) return 0; // safety
  const s = materialState.value[m.itemId];
  if (!s || s.source === 'gathered') return 0;

  // If sub-recipe is expanded, use sub-material costs instead of the item's market price
  const sub = subRecipes.value[m.itemId];
  if (sub?.expanded && sub?.recipe?.materials?.length) {
    const subCost = sub.recipe.materials.reduce((sum, sm) => sum + getMatCost(sm, depth + 1), 0);
    return subCost * (m.qty || 1);
  }

  return (s.price || 0) * (m.qty || 1);
};

// Computed: total material cost (includes sub-recipe breakdown when expanded)
const recipeTotalCost = computed(() => {
  if (!selectedRecipe.value) return 0;
  return selectedRecipe.value.materials.reduce((sum, m) => sum + getMatCost(m), 0);
});

// Computed: breakdown by source
const recipeMarketCost = computed(() => recipeTotalCost.value);
const recipeGatheredCount = computed(() => {
  if (!selectedRecipe.value) return 0;
  // Count all gathered materials across all sub-recipe depths
  let count = 0;
  const countGathered = (materials) => {
    for (const m of materials) {
      if (materialState.value[m.itemId]?.source === 'gathered') count++;
      const sub = subRecipes.value[m.itemId];
      if (sub?.expanded && sub?.recipe?.materials) countGathered(sub.recipe.materials);
    }
  };
  countGathered(selectedRecipe.value.materials);
  return count;
});

// Computed: sell revenue (first result item)
const recipeTaxRate = computed(() => recipeHasValuePack.value ? 0.155 : 0.35);
const recipeSellPrice = computed(() => {
  if (!selectedRecipe.value?.results?.length) return 0;
  const firstResult = selectedRecipe.value.results[0];
  const s = materialState.value[firstResult.itemId];
  return s?.price || 0;
});
const recipeSellRevenue = computed(() => Math.floor(recipeSellPrice.value * (1 - recipeTaxRate.value)));
const recipeProfit = computed(() => recipeSellRevenue.value - recipeTotalCost.value);
const recipeROI = computed(() => {
  if (!recipeTotalCost.value) return 0;
  return ((recipeProfit.value / recipeTotalCost.value) * 100).toFixed(1);
});

const clearRecipe = () => {
  selectedRecipe.value = null;
  recipeQuery.value = '';
  recipeResults.value = [];
  materialState.value = {};
  recipeError.value = '';
  subRecipes.value = {};
};

// ─── SUB-RECIPES (expandable material breakdown) ─────────────────────────────
// keyed by parent material itemId → { loading, recipe, expanded }
const subRecipes = ref({});

const toggleSubRecipe = async (material) => {
  const key = material.itemId;
  if (subRecipes.value[key]?.recipe) {
    // Already loaded — just toggle expand/collapse
    subRecipes.value[key].expanded = !subRecipes.value[key].expanded;
    return;
  }
  // Not loaded yet (shouldn't happen since auto-expand loads them, but handle it)
  await autoExpandSubRecipe(material);
};

// ─── IMPERIAL COOKING ────────────────────────────────────────────────────────
const showImpFormula = ref(false);
const imp = ref({
  mastery: 0,
  cp: 300,
  tierIndex: 5, // default Guru
  matCostPerBox: null,
});

// Imperial box item search
const impItemSearch = ref(itemSearchState());
const impLoadingRecipe = ref(false);
const onImpItemSearch = () => doItemSearch(impItemSearch.value, 'na');
const hideImpDropdown = () => hideDropdown(impItemSearch.value);
const selectImpItem = async (item) => {
  impItemSearch.value.query = item.name;
  impItemSearch.value.showDropdown = false;
  impLoadingRecipe.value = true;
  // Look up the recipe for this imperial box to calculate material cost
  try {
    const recipeId = await findRecipeIdByName(item.name);
    if (recipeId) {
      const recipe = await fetchRecipe(recipeId);
      if (recipe?.materials?.length) {
        let totalCost = 0;
        await Promise.all(recipe.materials.map(async (m) => {
          let price = null;
          if (m.itemId) {
            try { const d = await fetchMarketPrice(m.itemId, 'na'); price = d?.price || null; } catch {}
          }
          if (!price) {
            try {
              const results = await searchMarketItems(m.name, 'na');
              const match = results.find(r => r.name.toLowerCase() === m.name.toLowerCase()) || results[0];
              if (match?.id) { const d = await fetchMarketPrice(match.id, 'na'); price = d?.price || null; }
            } catch {}
          }
          if (!price) price = getStaticPrice(m.name);
          totalCost += (price || 0) * (m.qty || 1);
        }));
        if (totalCost > 0) imp.value.matCostPerBox = totalCost;
      }
    }
  } catch {}
  impLoadingRecipe.value = false;
};

const impTier = computed(() => BOX_TIERS[imp.value.tierIndex]);
const impMasteryBonus = computed(() => getMasteryBonus(imp.value.mastery));
const impMasteryPct = computed(() => (impMasteryBonus.value * 100).toFixed(2));
const impBoxSellPrice = computed(() => getBoxSellPrice(impTier.value.basePrice, imp.value.mastery));
const impBoxLimit = computed(() => getBoxLimit(imp.value.cp));
const impProfitPerBox = computed(() => impBoxSellPrice.value - (imp.value.matCostPerBox || 0));
const impDailyRevenue = computed(() => impBoxLimit.value * impBoxSellPrice.value);
const impDailyProfit = computed(() => impBoxLimit.value * impProfitPerBox.value);
const impROI = computed(() => {
  if (!imp.value.matCostPerBox) return 0;
  return ((impProfitPerBox.value / imp.value.matCostPerBox) * 100).toFixed(1);
});

// ─── CRATE TRADING ──────────────────────────────────────────────────────────
const showTradeFormula = ref(false);
const trade = ref({
  basePrice: null,
  distanceBonus: 150,
  levelIndex: 50,
  matCost: null,
  quantity: 1,
  from: '',
  to: '',
});

// Auto-update distance bonus when from/to change
watch(() => [trade.value.from, trade.value.to], ([from, to]) => {
  if (!from || !to) return;
  const loc = PICKUP_LOCATIONS.find(l => l.name === from);
  if (!loc) return;
  const bonus = DISTANCE_BONUS[loc.region]?.[to];
  if (bonus != null) trade.value.distanceBonus = bonus;
}, { immediate: false });

// Item search
const crateQuery = ref('');
const crateShowDropdown = ref(false);
const crateFilteredList = computed(() => {
  const q = crateQuery.value.trim().toLowerCase();
  if (!q) return ALL_TRADE_ITEMS.slice(0, 50);
  return ALL_TRADE_ITEMS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.region.toLowerCase().includes(q) ||
    (c.location || '').toLowerCase().includes(q)
  );
});

const tradeLoadingMats = ref(false);
const selectCrate = async (crate) => {
  crateQuery.value = crate.name;
  trade.value.basePrice = crate.basePrice;
  crateShowDropdown.value = false;
  // Auto-set from location if item has one
  if (crate.location && crate.location !== 'Crafted') {
    trade.value.from = crate.location;
  }
  // Auto-fill material cost for crafted crates
  if (crate.location === 'Crafted' || crate.region === 'Crate') {
    tradeLoadingMats.value = true;
    try {
      const recipeId = await findRecipeIdByName(crate.name);
      if (recipeId) {
        const recipe = await fetchRecipe(recipeId);
        if (recipe?.materials?.length) {
          let totalCost = 0;
          await Promise.all(recipe.materials.map(async (m) => {
            let price = null;
            if (m.itemId) {
              try { const d = await fetchMarketPrice(m.itemId, 'na'); price = d?.price || null; } catch {}
            }
            if (!price) {
              try {
                const results = await searchMarketItems(m.name, 'na');
                const match = results.find(r => r.name.toLowerCase() === m.name.toLowerCase()) || results[0];
                if (match?.id) { const d = await fetchMarketPrice(match.id, 'na'); price = d?.price || null; }
              } catch {}
            }
            if (!price) price = getStaticPrice(m.name);
            totalCost += (price || 0) * (m.qty || 1);
          }));
          if (totalCost > 0) trade.value.matCost = totalCost;
        }
      }
    } catch {}
    tradeLoadingMats.value = false;
  }
};
const clearCrate = () => {
  crateQuery.value = '';
  trade.value.basePrice = null;
  crateShowDropdown.value = false;
};
const hideCrateDropdown = () => setTimeout(() => { crateShowDropdown.value = false; }, 150);

// Saved trades (localStorage)
const SAVED_TRADE_KEY = 'bdo-saved-trades';
const loadSavedTrades = () => {
  try { return JSON.parse(localStorage.getItem(SAVED_TRADE_KEY) || '[]'); } catch { return []; }
};
const savedTrades = ref(loadSavedTrades());
const savedTradeName = ref('');
const editingIndex = ref(-1); // -1 = not editing

const persistSaves = () => localStorage.setItem(SAVED_TRADE_KEY, JSON.stringify(savedTrades.value));

const saveTrade = () => {
  const name = savedTradeName.value.trim();
  if (!name) return;
  const entry = {
    name,
    crateName: crateQuery.value,
    basePrice: trade.value.basePrice,
    matCost: trade.value.matCost,
    distanceBonus: trade.value.distanceBonus,
    levelIndex: trade.value.levelIndex,
    quantity: trade.value.quantity,
    from: trade.value.from,
    to: trade.value.to,
  };
  if (editingIndex.value >= 0) {
    savedTrades.value[editingIndex.value] = entry;
    editingIndex.value = -1;
  } else {
    const existing = savedTrades.value.findIndex(s => s.name === name);
    if (existing >= 0) savedTrades.value[existing] = entry;
    else savedTrades.value.push(entry);
  }
  persistSaves();
  savedTradeName.value = '';
};

const loadSavedTrade = (entry) => {
  crateQuery.value = entry.crateName || '';
  trade.value.basePrice = entry.basePrice;
  trade.value.matCost = entry.matCost;
  trade.value.distanceBonus = entry.distanceBonus;
  trade.value.levelIndex = entry.levelIndex;
  trade.value.quantity = entry.quantity;
  trade.value.from = entry.from || '';
  trade.value.to = entry.to || '';
};

const editSavedTrade = (i) => {
  loadSavedTrade(savedTrades.value[i]);
  savedTradeName.value = savedTrades.value[i].name;
  editingIndex.value = i;
};

const cancelEdit = () => {
  editingIndex.value = -1;
  savedTradeName.value = '';
};

const deleteSavedTrade = (i) => {
  selectedSetups.value.delete(i);
  savedTrades.value.splice(i, 1);
  // Re-index selected setups above deleted index
  const updated = new Set();
  for (const idx of selectedSetups.value) {
    updated.add(idx > i ? idx - 1 : idx);
  }
  selectedSetups.value = updated;
  persistSaves();
};

// Multi-select for combined calculation
const selectedSetups = ref(new Set());

const toggleSetupSelect = (i) => {
  const s = new Set(selectedSetups.value);
  if (s.has(i)) s.delete(i); else s.add(i);
  selectedSetups.value = s;
};

const combinedStats = computed(() => {
  if (selectedSetups.value.size === 0) return null;
  let totalCost = 0, totalRevenue = 0, totalQuantity = 0;
  for (const i of selectedSetups.value) {
    const s = savedTrades.value[i];
    if (!s) continue;
    const sell = getCrateSellPrice(s.basePrice || 0, s.distanceBonus || 0, s.levelIndex || 0);
    const qty = s.quantity || 1;
    totalCost += (s.matCost || 0) * qty;
    totalRevenue += sell * qty;
    totalQuantity += qty;
  }
  const totalProfit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : '0.0';
  return { totalCost, totalRevenue, totalProfit, totalQuantity, roi, count: selectedSetups.value.size };
});

const tradeBargainPct = computed(() => getBargainBonus(trade.value.levelIndex));
const tradeLevelLabel = computed(() => TRADING_LEVELS[trade.value.levelIndex]?.label || '');
const tradeSellPrice = computed(() => getCrateSellPrice(trade.value.basePrice || 0, trade.value.distanceBonus || 0, trade.value.levelIndex));
const tradeProfitPerCrate = computed(() => tradeSellPrice.value - (trade.value.matCost || 0));
const tradeTotalProfit = computed(() => tradeProfitPerCrate.value * (trade.value.quantity || 1));
const tradeROI = computed(() => {
  if (!trade.value.matCost) return 0;
  return ((tradeProfitPerCrate.value / trade.value.matCost) * 100).toFixed(1);
});

// ─── PROCESSING ROI CALCULATOR ───────────────────────────────────────────────
const proc = ref({
  hasValuePack: true,
  category: '',
  inputs: [{ name: '', cost: null, qty: 1 }],
  outputs: [{ name: '', sellPrice: null, qty: 1 }],
  batchesPerSession: 1,
  masteryLevel: 0,
});

// Processing recipe selection
const procRecipeQuery = ref('');
const procRecipeShowDropdown = ref(false);
const procLoadingRecipe = ref(false);
const filteredProcRecipes = computed(() => {
  const cat = proc.value.category;
  const q = procRecipeQuery.value.trim().toLowerCase();
  let list = PROCESSING_RECIPES;
  if (cat) list = list.filter(r => r.category === cat);
  if (q) list = list.filter(r => r.name.toLowerCase().includes(q));
  return list;
});
const hideProcRecipeDropdown = () => setTimeout(() => { procRecipeShowDropdown.value = false; }, 150);

const selectProcRecipe = async (recipe) => {
  procRecipeQuery.value = recipe.name;
  procRecipeShowDropdown.value = false;
  procLoadingRecipe.value = true;
  // Reset search states
  procInputSearch.value = {};
  procOutputSearch.value = {};
  // Populate inputs
  proc.value.inputs = recipe.inputs.map(m => ({ name: m.name, cost: null, qty: m.qty }));
  // Populate outputs
  proc.value.outputs = recipe.outputs.map(m => ({ name: m.name, sellPrice: null, qty: m.qty }));
  // Set search queries
  recipe.inputs.forEach((m, i) => { getProcInputSearch(i).query = m.name; });
  recipe.outputs.forEach((m, i) => { getProcOutputSearch(i).query = m.name; });
  // Fetch all prices in parallel
  const region = procRegion.value;
  await Promise.all([
    ...recipe.inputs.map(async (m, i) => {
      const price = await resolveItem({ name: m.name }, region);
      if (price) proc.value.inputs[i].cost = price;
    }),
    ...recipe.outputs.map(async (m, i) => {
      const price = await resolveItem({ name: m.name }, region);
      if (price) proc.value.outputs[i].sellPrice = price;
    }),
  ]);
  procLoadingRecipe.value = false;
};

// Processing mastery → bonus yield (approximate, based on BDO mastery brackets)
const PROC_MASTERY_YIELD = [
  [0, 1.0], [50, 1.05], [100, 1.10], [150, 1.15], [200, 1.20], [250, 1.28],
  [300, 1.35], [350, 1.43], [400, 1.50], [450, 1.58], [500, 1.68],
  [550, 1.78], [600, 1.90], [650, 2.00], [700, 2.13], [750, 2.25],
  [800, 2.40], [850, 2.55], [900, 2.70], [950, 2.85], [1000, 3.00],
  [1100, 3.20], [1200, 3.40], [1300, 3.60], [1400, 3.80], [1500, 4.00],
  [1600, 4.15], [1700, 4.30], [1800, 4.45], [1900, 4.55], [2000, 4.65],
];
const procMasteryYield = computed(() => {
  const m = proc.value.masteryLevel || 0;
  let mult = 1.0;
  for (const [threshold, val] of PROC_MASTERY_YIELD) {
    if (m >= threshold) mult = val;
    else break;
  }
  return mult;
});
const procRegion = ref('na');

// Input material search states
const procInputSearch = ref({});
const getProcInputSearch = (i) => {
  if (!procInputSearch.value[i]) procInputSearch.value[i] = itemSearchState();
  return procInputSearch.value[i];
};
const onProcInputSearch = (i) => doItemSearch(getProcInputSearch(i), procRegion.value);
const selectProcInput = async (i, item) => {
  const s = getProcInputSearch(i);
  s.query = item.name;
  s.showDropdown = false;
  proc.value.inputs[i].name = item.name;
  s.priceLoading = true;
  const price = await resolveItem(item, procRegion.value);
  if (price) proc.value.inputs[i].cost = price;
  s.priceLoading = false;
};

// Output product search states
const procOutputSearch = ref({});
const getProcOutputSearch = (i) => {
  if (!procOutputSearch.value[i]) procOutputSearch.value[i] = itemSearchState();
  return procOutputSearch.value[i];
};
const onProcOutputSearch = (i) => doItemSearch(getProcOutputSearch(i), procRegion.value);
const selectProcOutput = async (i, item) => {
  const s = getProcOutputSearch(i);
  s.query = item.name;
  s.showDropdown = false;
  proc.value.outputs[i].name = item.name;
  s.priceLoading = true;
  const price = await resolveItem(item, procRegion.value);
  if (price) proc.value.outputs[i].sellPrice = price;
  s.priceLoading = false;
};

const addProcInput = () => proc.value.inputs.push({ name: '', cost: null, qty: 1 });
const removeProcInput = (i) => {
  proc.value.inputs.splice(i, 1);
  delete procInputSearch.value[i];
};
const addProcOutput = () => proc.value.outputs.push({ name: '', sellPrice: null, qty: 1 });
const removeProcOutput = (i) => {
  proc.value.outputs.splice(i, 1);
  delete procOutputSearch.value[i];
};

const procTaxRate = computed(() => proc.value.hasValuePack ? 0.155 : 0.35);
const procTotalInputCost = computed(() =>
  proc.value.inputs.reduce((sum, m) => sum + (m.cost || 0) * (m.qty || 1), 0)
);
const procTotalOutputRevenue = computed(() => {
  const yieldMult = procMasteryYield.value;
  return proc.value.outputs.reduce((sum, o) => {
    const price = o.sellPrice || 0;
    return sum + Math.floor(price * (1 - procTaxRate.value) * (o.qty || 1) * yieldMult);
  }, 0);
});
const procTotalOutputRaw = computed(() => {
  const yieldMult = procMasteryYield.value;
  return proc.value.outputs.reduce((sum, o) => sum + Math.floor((o.sellPrice || 0) * (o.qty || 1) * yieldMult), 0);
});
const procProfitPerBatch = computed(() => procTotalOutputRevenue.value - procTotalInputCost.value);
const procProfitPerSession = computed(() => procProfitPerBatch.value * (proc.value.batchesPerSession || 1));
const procROI = computed(() => {
  if (!procTotalInputCost.value) return 0;
  return ((procProfitPerBatch.value / procTotalInputCost.value) * 100).toFixed(1);
});

// ─── FORMATTING ──────────────────────────────────────────────────────────────
const silver = (n) => {
  if (n == null) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K';
  return sign + abs.toLocaleString();
};
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>BDO Profit Calculator</h1>
      <p class="subtitle">Black Desert Online — ROI & Silver Calculator</p>
    </header>

    <nav class="tabs">
      <button :class="['tab', { active: tab === 'marketplace' }]" @click="tab = 'marketplace'">Marketplace</button>
      <button :class="['tab', { active: tab === 'crafting' }]" @click="tab = 'crafting'">Crafting</button>
      <button :class="['tab', { active: tab === 'enhancement' }]" @click="tab = 'enhancement'">Enhancement</button>
      <button :class="['tab', { active: tab === 'recipes' }]" @click="tab = 'recipes'">Recipes</button>
      <button :class="['tab', { active: tab === 'processing' }]" @click="tab = 'processing'">Processing</button>
      <button :class="['tab', { active: tab === 'imperial' }]" @click="tab = 'imperial'">Imperial</button>
      <button :class="['tab', { active: tab === 'trading' }]" @click="tab = 'trading'">Trading</button>
    </nav>

    <main class="content">

      <!-- ═══ MARKETPLACE TAX ═══ -->
      <section v-if="tab === 'marketplace'" class="calc-section">
        <h2>Marketplace Tax Calculator</h2>

        <div class="recipe-controls" style="margin-bottom: 12px;">
          <label class="toggle-row" style="margin-bottom:0; flex:1;">
            <input type="checkbox" v-model="mp.hasValuePack" />
            <span>Value Pack active <span class="hint">({{ mp.hasValuePack ? '15.5%' : '35%' }} tax)</span></span>
          </label>
          <select v-model="mpRegion" class="region-select">
            <option value="na">NA</option>
            <option value="eu">EU</option>
            <option value="sea">SEA</option>
            <option value="sa">SA</option>
          </select>
        </div>

        <!-- Item search -->
        <div class="recipe-search-wrap" style="margin-bottom: 12px;">
          <input
            class="recipe-search"
            v-model="mpItemQuery"
            placeholder="Search any item (e.g. Black Stone, Dim Tree)..."
            @input="onMpItemSearch"
            @blur="hideMpDropdown"
            @focus="mpItemResults.length && (mpItemShowDropdown = true)"
          />
          <span v-if="mpItemSearching" class="recipe-spinner">searching…</span>
          <span v-else-if="mpItemPriceLoading" class="recipe-spinner">loading…</span>
          <button v-else-if="mpItemQuery" class="recipe-clear" @click="clearMpItem">clear</button>
          <div v-if="mpItemShowDropdown && mpItemResults.length" class="recipe-dropdown">
            <div
              v-for="item in mpItemResults.slice(0, 30)" :key="item.id"
              class="recipe-dropdown-item"
              @mousedown.prevent="selectMpItem(item)"
            >
              <span class="recipe-dropdown-name">{{ item.name }}</span>
              <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Sell Price (per item) <span v-if="mpItemPriceLoading" class="hint">fetching…</span></label>
            <input type="number" v-model.number="mp.sellPrice" placeholder="e.g. 50000000" />
          </div>
          <div class="field">
            <label>Quantity</label>
            <input type="number" v-model.number="mp.quantity" min="1" placeholder="1" />
          </div>
        </div>

        <div class="results-card">
          <div class="result-row">
            <span>Tax Rate</span>
            <span class="val">{{ mpTaxLabel }}</span>
          </div>
          <div class="result-row">
            <span>Tax Deducted</span>
            <span class="val loss">-{{ silver(mpTaxAmount) }}</span>
          </div>
          <div class="result-row highlight">
            <span>You Receive</span>
            <span class="val profit">{{ silver(mpRevenue) }}</span>
          </div>
        </div>
      </section>

      <!-- ═══ CRAFTING ROI ═══ -->
      <section v-if="tab === 'crafting'" class="calc-section">
        <h2>Crafting ROI Calculator</h2>

        <div class="recipe-controls" style="margin-bottom: 12px;">
          <label class="toggle-row" style="margin-bottom:0; flex:1;">
            <input type="checkbox" v-model="craft.hasValuePack" />
            <span>Value Pack active <span class="hint">({{ craft.hasValuePack ? '15.5%' : '35%' }} tax)</span></span>
          </label>
          <select v-model="craftRegion" class="region-select">
            <option value="na">NA</option>
            <option value="eu">EU</option>
            <option value="sea">SEA</option>
            <option value="sa">SA</option>
          </select>
        </div>

        <!-- Finished item search -->
        <div class="recipe-search-wrap" style="margin-bottom: 8px;">
          <input
            class="recipe-search" style="font-size: 0.9rem; padding: 10px 12px;"
            v-model="craftItemSearch.query"
            placeholder="Search finished item to sell..."
            @input="onCraftItemSearch"
            @blur="hideDropdown(craftItemSearch)"
            @focus="craftItemSearch.results.length && (craftItemSearch.showDropdown = true)"
          />
          <span v-if="craftItemSearch.searching" class="recipe-spinner">searching…</span>
          <span v-else-if="craftItemSearch.priceLoading" class="recipe-spinner">loading…</span>
          <div v-if="craftItemSearch.showDropdown && craftItemSearch.results.length" class="recipe-dropdown">
            <div v-for="item in craftItemSearch.results.slice(0, 20)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectCraftItem(item)">
              <span class="recipe-dropdown-name">{{ item.name }}</span>
              <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Sell Price (finished item) <span v-if="craftItemSearch.priceLoading" class="hint">fetching…</span></label>
            <input type="number" v-model.number="craft.sellPrice" placeholder="e.g. 100000000" />
          </div>
          <div class="field">
            <label>Crafts per session</label>
            <input type="number" v-model.number="craft.craftsPerSession" min="1" placeholder="1" />
          </div>
        </div>

        <h3 class="sub-heading">Materials <span v-if="craftLoadingRecipe" class="recipe-spinner">loading recipe…</span></h3>
        <div v-for="(m, i) in craft.materials" :key="i" class="material-row-wrap">
          <div class="material-row">
            <label class="gathered-check" :title="m.gathered ? 'Marked as gathered (free)' : 'Click if hand-gathered'">
              <input type="checkbox" :checked="m.gathered" @change="toggleGathered(m)" />
              <span class="gathered-icon">{{ m.gathered ? '🌿' : '' }}</span>
            </label>
            <div class="mat-search-wrap">
              <input
                :value="getMatSearch(i).query || m.name"
                @input="e => { getMatSearch(i).query = e.target.value; m.name = e.target.value; onMatSearch(i); }"
                @focus="getMatSearch(i).results.length && (getMatSearch(i).showDropdown = true)"
                @blur="hideDropdown(getMatSearch(i))"
                class="mat-name"
                :class="{ 'mat-gathered': m.gathered }"
                placeholder="Search material..."
              />
              <div v-if="getMatSearch(i).showDropdown && getMatSearch(i).results.length" class="recipe-dropdown mat-dropdown">
                <div v-for="item in getMatSearch(i).results.slice(0, 15)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectMatItem(i, item)">
                  <span class="recipe-dropdown-name">{{ item.name }}</span>
                  <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
                </div>
              </div>
            </div>
            <input type="number" v-model.number="m.cost" class="mat-cost" :class="{ 'mat-gathered': m.gathered }" :disabled="m.gathered" placeholder="Cost each" />
            <input type="number" v-model.number="m.qty" class="mat-qty" min="1" placeholder="Qty" />
            <button v-if="m.hasRecipe && m.subMaterials.length" class="mat-expand" :class="{ active: m.showSubs }" @click="m.showSubs = !m.showSubs" title="Show sub-materials">▾</button>
            <button class="mat-remove" @click="removeMaterial(i)" v-if="craft.materials.length > 1">x</button>
          </div>
          <span v-if="getMatSearch(i).priceLoading" class="hint" style="margin-left: 4px;">fetching price…</span>
          <!-- Sub-materials dropdown -->
          <div v-if="m.showSubs && m.subMaterials.length" class="sub-materials">
            <div class="sub-mat-header">Sub-materials for {{ m.name }}</div>
            <div v-for="(sm, si) in m.subMaterials" :key="si" class="sub-material-row">
              <label class="gathered-check" :title="sm.gathered ? 'Hand-gathered (free)' : 'Click if hand-gathered'">
                <input type="checkbox" :checked="sm.gathered" @change="toggleSubGathered(sm)" />
                <span class="gathered-icon">{{ sm.gathered ? '🌿' : '' }}</span>
              </label>
              <span class="sub-mat-name" :class="{ 'mat-gathered': sm.gathered }">{{ sm.name }}</span>
              <input type="number" v-model.number="sm.cost" class="sub-mat-cost" :class="{ 'mat-gathered': sm.gathered }" :disabled="sm.gathered" placeholder="Cost" />
              <span class="sub-mat-qty">x{{ sm.qty }}</span>
              <span class="sub-mat-total">= {{ silver(sm.gathered ? 0 : (sm.cost || 0) * (sm.qty || 1)) }}</span>
            </div>
          </div>
        </div>
        <button class="btn-add-mat" @click="addMaterial">+ Add Material</button>

        <div class="results-card">
          <div class="result-row">
            <span>Total Material Cost</span>
            <span class="val">{{ silver(craftTotalMaterialCost) }}</span>
          </div>
          <div class="result-row">
            <span>Revenue After Tax</span>
            <span class="val">{{ silver(craftRevenuePerItem) }}</span>
          </div>
          <div class="result-row" :class="craftProfitPerItem >= 0 ? '' : 'loss-row'">
            <span>Profit Per Item</span>
            <span class="val" :class="craftProfitPerItem >= 0 ? 'profit' : 'loss'">{{ silver(craftProfitPerItem) }}</span>
          </div>
          <div class="result-row highlight" :class="craftProfitPerSession >= 0 ? '' : 'loss-row'">
            <span>Profit Per Session (x{{ craft.craftsPerSession || 1 }})</span>
            <span class="val" :class="craftProfitPerSession >= 0 ? 'profit' : 'loss'">{{ silver(craftProfitPerSession) }}</span>
          </div>
          <div class="result-row">
            <span>ROI</span>
            <span class="val" :class="craftROI >= 0 ? 'profit' : 'loss'">{{ craftROI }}%</span>
          </div>
        </div>
      </section>

      <!-- ═══ ENHANCEMENT ROI ═══ -->
      <section v-if="tab === 'enhancement'" class="calc-section">
        <h2>Enhancement ROI Calculator</h2>

        <div class="recipe-controls" style="margin-bottom: 12px;">
          <label class="toggle-row" style="margin-bottom:0; flex:1;">
            <input type="checkbox" v-model="enhance.hasValuePack" />
            <span>Value Pack active <span class="hint">({{ enhance.hasValuePack ? '15.5%' : '35%' }} tax)</span></span>
          </label>
          <select v-model="enhRegion" class="region-select">
            <option value="na">NA</option>
            <option value="eu">EU</option>
            <option value="sea">SEA</option>
            <option value="sa">SA</option>
          </select>
        </div>

        <!-- Base item search -->
        <div class="recipe-search-wrap" style="margin-bottom: 8px;">
          <input
            class="recipe-search" style="font-size: 0.9rem; padding: 10px 12px;"
            v-model="enhBaseSearch.query"
            placeholder="Search base item (e.g. Dim Tree Spirit's Armor)..."
            @input="onEnhBaseSearch"
            @blur="hideDropdown(enhBaseSearch)"
            @focus="enhBaseSearch.results.length && (enhBaseSearch.showDropdown = true)"
          />
          <span v-if="enhBaseSearch.searching" class="recipe-spinner">searching…</span>
          <span v-else-if="enhBaseSearch.priceLoading" class="recipe-spinner">loading…</span>
          <div v-if="enhBaseSearch.showDropdown && enhBaseSearch.results.length" class="recipe-dropdown">
            <div v-for="item in enhBaseSearch.results.slice(0, 20)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectEnhBase(item)">
              <span class="recipe-dropdown-name">{{ item.name }}</span>
              <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
            </div>
          </div>
        </div>

        <!-- Target item search -->
        <div class="recipe-search-wrap" style="margin-bottom: 8px;">
          <input
            class="recipe-search" style="font-size: 0.9rem; padding: 10px 12px;"
            v-model="enhTargetSearch.query"
            placeholder="Search enhanced result (e.g. PEN Dim Tree)..."
            @input="onEnhTargetSearch"
            @blur="hideDropdown(enhTargetSearch)"
            @focus="enhTargetSearch.results.length && (enhTargetSearch.showDropdown = true)"
          />
          <span v-if="enhTargetSearch.searching" class="recipe-spinner">searching…</span>
          <span v-else-if="enhTargetSearch.priceLoading" class="recipe-spinner">loading…</span>
          <div v-if="enhTargetSearch.showDropdown && enhTargetSearch.results.length" class="recipe-dropdown">
            <div v-for="item in enhTargetSearch.results.slice(0, 20)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectEnhTarget(item)">
              <span class="recipe-dropdown-name">{{ item.name }}</span>
              <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Base Item Cost <span v-if="enhBaseSearch.priceLoading" class="hint">fetching…</span></label>
            <input type="number" v-model.number="enhance.baseItemCost" placeholder="Cost of item to enhance" />
          </div>
          <div class="field">
            <label>Target Sell Price <span v-if="enhTargetSearch.priceLoading" class="hint">fetching…</span></label>
            <input type="number" v-model.number="enhance.targetSellPrice" placeholder="MP price after success" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Success Rate (%)</label>
            <input type="number" v-model.number="enhance.successRate" min="0" max="100" step="0.1" placeholder="e.g. 30" />
          </div>
          <div class="field">
            <label>Failstack Cost</label>
            <input type="number" v-model.number="enhance.failstackCost" placeholder="Cost to build FS" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Cron Stone Cost (each) <span v-if="enhance.cronStoneCost" class="hint" style="color:#4caf50;">auto-filled</span></label>
            <input type="number" v-model.number="enhance.cronStoneCost" placeholder="0 if not using" />
          </div>
          <div class="field">
            <label>Cron Stones Needed</label>
            <input type="number" v-model.number="enhance.cronStonesNeeded" min="0" placeholder="0" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Repair Cost (per fail) <span v-if="enhance.repairCost" class="hint" style="color:#4caf50;">auto-filled</span></label>
            <input type="number" v-model.number="enhance.repairCost" placeholder="Memory frags etc" />
          </div>
          <div class="field">
            <label>Simulate Attempts</label>
            <input type="number" v-model.number="enhance.attemptsToSimulate" min="1" max="100" placeholder="10" />
          </div>
        </div>

        <div class="results-card">
          <div class="result-row">
            <span>Cost Per Attempt</span>
            <span class="val">{{ silver(enhCostPerAttempt) }}</span>
          </div>
          <div class="result-row">
            <span>Expected Attempts (1/rate)</span>
            <span class="val">{{ enhExpectedAttempts }}</span>
          </div>
          <div class="result-row">
            <span>Expected Total Cost</span>
            <span class="val">{{ silver(enhExpectedTotalCost) }}</span>
          </div>
          <div class="result-row">
            <span>Sell Revenue (after tax)</span>
            <span class="val">{{ silver(enhSellRevenue) }}</span>
          </div>
          <div class="result-row highlight" :class="enhExpectedProfit >= 0 ? '' : 'loss-row'">
            <span>Expected Profit</span>
            <span class="val" :class="enhExpectedProfit >= 0 ? 'profit' : 'loss'">{{ silver(enhExpectedProfit) }}</span>
          </div>
          <div class="result-row">
            <span>ROI</span>
            <span class="val" :class="enhROI >= 0 ? 'profit' : 'loss'">{{ enhROI }}%</span>
          </div>
        </div>

        <h3 class="sub-heading">Attempt Simulation</h3>
        <div class="sim-table-wrap">
          <table class="sim-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cumulative Cost</th>
                <th>Chance by Now</th>
                <th>Profit if Sold</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in enhSimRows" :key="r.attempt">
                <td>{{ r.attempt }}</td>
                <td>{{ silver(r.cumulativeCost) }}</td>
                <td>{{ r.cumulativeSuccessRate }}%</td>
                <td :class="r.profit >= 0 ? 'profit' : 'loss'">{{ silver(r.profit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══ RECIPE LOOKUP ═══ -->
      <section v-if="tab === 'recipes'" class="calc-section">
        <h2>Recipe Lookup</h2>
        <p class="hint" style="margin-bottom: 12px;">Search any cooking, alchemy, or processing recipe. Prices from BDO Central Market (NA).</p>

        <div class="recipe-controls">
          <label class="toggle-row">
            <input type="checkbox" v-model="recipeHasValuePack" />
            <span>Value Pack active <span class="hint">({{ recipeHasValuePack ? '15.5%' : '35%' }} tax)</span></span>
          </label>

          <div class="field" style="margin-bottom: 4px;">
            <label>Region</label>
            <select v-model="recipeRegion" class="region-select">
              <option value="na">NA</option>
              <option value="eu">EU</option>
              <option value="sea">SEA</option>
              <option value="sa">SA</option>
            </select>
          </div>
        </div>

        <!-- Search -->
        <div class="recipe-search-wrap">
          <input
            v-model="recipeQuery"
            @input="onRecipeSearch"
            @focus="showRecipeDropdown = recipeResults.length > 0"
            class="recipe-search"
            :placeholder="recipeIndexReady ? 'Search recipes... (e.g. Beer, Elixir of Fury, Plywood)' : 'Loading recipe index...'"
          />
          <span v-if="recipeSearching" class="recipe-spinner">Searching...</span>
          <button v-if="selectedRecipe" class="recipe-clear" @click="clearRecipe">Clear</button>

          <!-- Dropdown -->
          <div v-if="showRecipeDropdown && !selectedRecipe" class="recipe-dropdown">
            <div
              v-for="r in recipeResults.slice(0, 20)"
              :key="r.id"
              class="recipe-dropdown-item"
              @mousedown.prevent="selectRecipe(r)"
            >
              <span class="recipe-dropdown-name">{{ r.name }}</span>
              <span class="recipe-dropdown-cat">{{ r.category }}</span>
            </div>
          </div>
        </div>

        <p v-if="recipeError" class="recipe-error">{{ recipeError }}</p>

        <!-- Loading -->
        <div v-if="recipeLoading" class="recipe-loading">Loading recipe...</div>

        <!-- Recipe details -->
        <div v-if="selectedRecipe && !recipeLoading" class="recipe-details">
          <div class="recipe-header-info">
            <h3>{{ selectedRecipe.name }}</h3>
            <div class="recipe-meta">
              <span v-if="selectedRecipe.category" class="recipe-badge">{{ selectedRecipe.category }}</span>
              <span v-if="selectedRecipe.skillLevel" class="recipe-badge recipe-badge-skill">{{ selectedRecipe.skillLevel }}</span>
            </div>
          </div>

          <!-- Crafting Results -->
          <div v-if="selectedRecipe.results.length" class="recipe-results-section">
            <h4 class="sub-heading">Crafting Result</h4>
            <div v-for="r in selectedRecipe.results" :key="r.itemId" class="recipe-result-row">
              <span class="recipe-result-name">{{ r.name }}</span>
              <span class="recipe-result-qty">x{{ r.qty }}</span>
              <span class="recipe-result-price" v-if="materialState[r.itemId]">
                <template v-if="materialState[r.itemId].priceLoading">loading...</template>
                <template v-else-if="materialState[r.itemId].price">{{ silver(materialState[r.itemId].price) }}</template>
                <template v-else>no price</template>
              </span>
            </div>
          </div>

          <!-- Materials (recursive component for unlimited nesting) -->
          <h4 class="sub-heading">Materials ({{ selectedRecipe.materials.length }} items)</h4>
          <div class="recipe-mat-list">
            <RecipeMaterial
              v-for="m in selectedRecipe.materials"
              :key="m.itemId"
              :material="m"
              :materialState="materialState"
              :subRecipes="subRecipes"
              :silver="silver"
              :toggleSubRecipe="toggleSubRecipe"
              :depth="0"
            />
          </div>

          <!-- Refresh prices button -->
          <button class="btn-refresh-prices" @click="loadPrices" :disabled="recipePricesLoading">
            {{ recipePricesLoading ? 'Loading prices...' : 'Refresh Market Prices' }}
          </button>

          <!-- Summary -->
          <div class="results-card" style="margin-top: 16px;">
            <div class="result-row">
              <span>Market Materials Cost</span>
              <span class="val">{{ silver(recipeMarketCost) }}</span>
            </div>
            <div class="result-row">
              <span>Self-Gathered</span>
              <span class="val" style="color: #22c55e;">{{ recipeGatheredCount }} items (free)</span>
            </div>
            <div class="result-row">
              <span>Total Cost (bought only)</span>
              <span class="val">{{ silver(recipeTotalCost) }}</span>
            </div>
            <div class="result-row">
              <span>Sell Price ({{ selectedRecipe.results[0]?.name || 'result' }})</span>
              <span class="val">{{ silver(recipeSellPrice) }}</span>
            </div>
            <div class="result-row">
              <span>Revenue After Tax ({{ recipeHasValuePack ? '15.5%' : '35%' }})</span>
              <span class="val">{{ silver(recipeSellRevenue) }}</span>
            </div>
            <div class="result-row highlight" :class="recipeProfit >= 0 ? '' : 'loss-row'">
              <span>Profit Per Craft</span>
              <span class="val" :class="recipeProfit >= 0 ? 'profit' : 'loss'">{{ silver(recipeProfit) }}</span>
            </div>
            <div class="result-row">
              <span>ROI</span>
              <span class="val" :class="recipeROI >= 0 ? 'profit' : 'loss'">{{ recipeROI }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ PROCESSING ROI ═══ -->
      <section v-if="tab === 'processing'" class="calc-section">
        <h2>Processing ROI Calculator</h2>

        <div class="recipe-controls" style="margin-bottom: 12px;">
          <label class="toggle-row" style="margin-bottom:0; flex:1;">
            <input type="checkbox" v-model="proc.hasValuePack" />
            <span>Value Pack active <span class="hint">({{ proc.hasValuePack ? '15.5%' : '35%' }} tax on output sales)</span></span>
          </label>
          <select v-model="procRegion" class="region-select">
            <option value="na">NA</option>
            <option value="eu">EU</option>
            <option value="sea">SEA</option>
            <option value="sa">SA</option>
          </select>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Processing Mastery</label>
            <input type="number" v-model.number="proc.masteryLevel" min="0" max="2000" placeholder="e.g. 800" />
          </div>
          <div class="field">
            <label>Yield Multiplier</label>
            <input type="text" :value="procMasteryYield.toFixed(2) + 'x'" disabled class="mastery-display" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Processing Type</label>
            <select v-model="proc.category" style="padding: 10px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 0.95rem; width: 100%;">
              <option value="">All Categories</option>
              <option v-for="cat in PROCESSING_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="field" style="position:relative;">
            <label>Select Conversion <span v-if="procLoadingRecipe" class="recipe-spinner">loading prices…</span></label>
            <input
              v-model="procRecipeQuery"
              @input="procRecipeShowDropdown = filteredProcRecipes.length > 0"
              @focus="procRecipeShowDropdown = filteredProcRecipes.length > 0"
              @blur="hideProcRecipeDropdown"
              placeholder="e.g. Copper Ore → Melted Copper"
            />
            <div v-if="procRecipeShowDropdown && filteredProcRecipes.length" class="recipe-dropdown" style="max-height:300px;">
              <div v-for="r in filteredProcRecipes.slice(0, 30)" :key="r.name" class="recipe-dropdown-item" @mousedown.prevent="selectProcRecipe(r)">
                <span class="recipe-dropdown-name">{{ r.name }}</span>
                <span class="hint">{{ r.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input materials -->
        <h3 class="sub-heading">Input Materials (buy/gather)</h3>
        <div v-for="(m, i) in proc.inputs" :key="'in'+i" class="material-row-wrap">
          <div class="material-row">
            <div class="mat-search-wrap">
              <input
                :value="getProcInputSearch(i).query || m.name"
                @input="e => { getProcInputSearch(i).query = e.target.value; m.name = e.target.value; onProcInputSearch(i); }"
                @focus="getProcInputSearch(i).results.length && (getProcInputSearch(i).showDropdown = true)"
                @blur="hideDropdown(getProcInputSearch(i))"
                class="mat-name"
                placeholder="Search material..."
              />
              <div v-if="getProcInputSearch(i).showDropdown && getProcInputSearch(i).results.length" class="recipe-dropdown mat-dropdown">
                <div v-for="item in getProcInputSearch(i).results.slice(0, 15)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectProcInput(i, item)">
                  <span class="recipe-dropdown-name">{{ item.name }}</span>
                  <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
                </div>
              </div>
            </div>
            <input type="number" v-model.number="m.cost" class="mat-cost" placeholder="Cost each" />
            <input type="number" v-model.number="m.qty" class="mat-qty" min="1" placeholder="Qty" />
            <button class="mat-remove" @click="removeProcInput(i)" v-if="proc.inputs.length > 1">x</button>
          </div>
          <span v-if="getProcInputSearch(i).priceLoading" class="hint" style="margin-left: 4px;">fetching price…</span>
        </div>
        <button class="btn-add-mat" @click="addProcInput">+ Add Input</button>

        <!-- Output products -->
        <h3 class="sub-heading">Output Products (sell on MP)</h3>
        <div v-for="(o, i) in proc.outputs" :key="'out'+i" class="material-row-wrap">
          <div class="material-row">
            <div class="mat-search-wrap">
              <input
                :value="getProcOutputSearch(i).query || o.name"
                @input="e => { getProcOutputSearch(i).query = e.target.value; o.name = e.target.value; onProcOutputSearch(i); }"
                @focus="getProcOutputSearch(i).results.length && (getProcOutputSearch(i).showDropdown = true)"
                @blur="hideDropdown(getProcOutputSearch(i))"
                class="mat-name"
                placeholder="Search product..."
              />
              <div v-if="getProcOutputSearch(i).showDropdown && getProcOutputSearch(i).results.length" class="recipe-dropdown mat-dropdown">
                <div v-for="item in getProcOutputSearch(i).results.slice(0, 15)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectProcOutput(i, item)">
                  <span class="recipe-dropdown-name">{{ item.name }}</span>
                  <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
                </div>
              </div>
            </div>
            <input type="number" v-model.number="o.sellPrice" class="mat-cost" placeholder="Sell price" />
            <input type="number" v-model.number="o.qty" class="mat-qty" min="1" placeholder="Qty" />
            <button class="mat-remove" @click="removeProcOutput(i)" v-if="proc.outputs.length > 1">x</button>
          </div>
          <span v-if="getProcOutputSearch(i).priceLoading" class="hint" style="margin-left: 4px;">fetching price…</span>
        </div>
        <button class="btn-add-mat" @click="addProcOutput">+ Add Output</button>

        <div class="field" style="margin-top: 12px;">
          <label>Batches per session</label>
          <input type="number" v-model.number="proc.batchesPerSession" min="1" placeholder="1" style="padding: 10px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 0.95rem; width: 120px;" />
        </div>

        <div class="results-card" style="margin-top: 16px;">
          <div class="result-row">
            <span>Total Input Cost</span>
            <span class="val">{{ silver(procTotalInputCost) }}</span>
          </div>
          <div v-if="proc.masteryLevel > 0" class="result-row">
            <span>Mastery Yield Bonus</span>
            <span class="val" style="color:#f59e0b;">{{ procMasteryYield.toFixed(2) }}x output</span>
          </div>
          <div class="result-row">
            <span>Output Value (pre-tax{{ proc.masteryLevel > 0 ? ', with mastery' : '' }})</span>
            <span class="val">{{ silver(procTotalOutputRaw) }}</span>
          </div>
          <div class="result-row">
            <span>Output Revenue (after {{ proc.hasValuePack ? '15.5%' : '35%' }} tax)</span>
            <span class="val">{{ silver(procTotalOutputRevenue) }}</span>
          </div>
          <div class="result-row" :class="procProfitPerBatch >= 0 ? '' : 'loss-row'">
            <span>Profit Per Batch</span>
            <span class="val" :class="procProfitPerBatch >= 0 ? 'profit' : 'loss'">{{ silver(procProfitPerBatch) }}</span>
          </div>
          <div class="result-row highlight" :class="procProfitPerSession >= 0 ? '' : 'loss-row'">
            <span>Profit Per Session (x{{ proc.batchesPerSession || 1 }})</span>
            <span class="val" :class="procProfitPerSession >= 0 ? 'profit' : 'loss'">{{ silver(procProfitPerSession) }}</span>
          </div>
          <div class="result-row">
            <span>ROI</span>
            <span class="val" :class="procROI >= 0 ? 'profit' : 'loss'">{{ procROI }}%</span>
          </div>
        </div>
      </section>

      <!-- ═══ IMPERIAL COOKING ═══ -->
      <section v-if="tab === 'imperial'" class="calc-section">
        <h2>Imperial Cooking Delivery</h2>
        <p class="hint formula-toggle" style="margin-bottom: 12px;" @click="showImpFormula = !showImpFormula">
          {{ showImpFormula ? '▼' : '▶' }} Formula
        </p>
        <p v-if="showImpFormula" class="hint formula-box">Base Price x (2.50 + Mastery Bonus). No marketplace tax. Daily limit = CP / 2.</p>

        <div class="field-row">
          <div class="field" style="position:relative;">
            <label>Search Imperial Box <span v-if="impLoadingRecipe" class="recipe-spinner">calculating cost…</span></label>
            <input
              v-model="impItemSearch.query"
              @input="onImpItemSearch"
              @blur="hideImpDropdown"
              @focus="impItemSearch.results.length && (impItemSearch.showDropdown = true)"
              placeholder="e.g. Guru's Cooking Box"
            />
            <span v-if="impItemSearch.searching" class="recipe-spinner">searching…</span>
            <div v-if="impItemSearch.showDropdown && impItemSearch.results.length" class="recipe-dropdown">
              <div v-for="item in impItemSearch.results.slice(0, 20)" :key="item.id" class="recipe-dropdown-item" @mousedown.prevent="selectImpItem(item)">
                <span class="recipe-dropdown-name">{{ item.name }}</span>
                <span class="hint">{{ item.cat || ('ID ' + item.id) }}</span><span v-if="item.priceHint" class="price-hint">~{{ item.priceHint }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Cooking Mastery</label>
            <input type="number" v-model.number="imp.mastery" min="0" max="3000" placeholder="0" />
          </div>
          <div class="field">
            <label>Contribution Points</label>
            <input type="number" v-model.number="imp.cp" min="0" placeholder="300" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Box Tier</label>
            <select v-model.number="imp.tierIndex" class="region-select" style="width:100%;">
              <option v-for="(t, i) in BOX_TIERS" :key="i" :value="i">{{ t.name }} ({{ silver(t.basePrice) }} base)</option>
            </select>
          </div>
          <div class="field">
            <label>Material Cost Per Box <span v-if="impLoadingRecipe" class="hint">calculating…</span></label>
            <input type="number" v-model.number="imp.matCostPerBox" placeholder="e.g. 200000" />
          </div>
        </div>

        <div class="results-card">
          <div class="result-row">
            <span>Box Tier</span>
            <span class="val">{{ impTier.name }} ({{ impTier.level }})</span>
          </div>
          <div class="result-row">
            <span>Mastery Bonus</span>
            <span class="val" style="color: #60a5fa;">+{{ impMasteryPct }}%</span>
          </div>
          <div class="result-row">
            <span>Box Sell Price</span>
            <span class="val" style="color: #f59e0b;">{{ silver(impBoxSellPrice) }}</span>
          </div>
          <div class="result-row">
            <span>Daily Box Limit (CP/2)</span>
            <span class="val">{{ impBoxLimit }} boxes</span>
          </div>
          <div class="result-row" :class="impProfitPerBox >= 0 ? '' : 'loss-row'">
            <span>Profit Per Box</span>
            <span class="val" :class="impProfitPerBox >= 0 ? 'profit' : 'loss'">{{ silver(impProfitPerBox) }}</span>
          </div>
          <div class="result-row">
            <span>Daily Revenue</span>
            <span class="val" style="color: #f59e0b;">{{ silver(impDailyRevenue) }}</span>
          </div>
          <div class="result-row highlight" :class="impDailyProfit >= 0 ? '' : 'loss-row'">
            <span>Daily Profit</span>
            <span class="val" :class="impDailyProfit >= 0 ? 'profit' : 'loss'">{{ silver(impDailyProfit) }}</span>
          </div>
          <div class="result-row">
            <span>ROI</span>
            <span class="val" :class="impROI >= 0 ? 'profit' : 'loss'">{{ impROI }}%</span>
          </div>
        </div>
      </section>

      <!-- ═══ CRATE TRADING ═══ -->
      <section v-if="tab === 'trading'" class="calc-section">
        <h2>Trade Calculator</h2>
        <p class="hint formula-toggle" style="margin-bottom: 12px;" @click="showTradeFormula = !showTradeFormula">
          {{ showTradeFormula ? '▼' : '▶' }} Formula
        </p>
        <p v-if="showTradeFormula" class="hint formula-box">Base Price x (1 + Distance%) x (1 + Bargain%)</p>

        <!-- Item search -->
        <div class="recipe-search-wrap" style="margin-bottom: 12px;">
          <input
            class="recipe-search"
            v-model="crateQuery"
            placeholder="Search trade item (e.g. Calpheon Timber, Yukjo, Valencia)..."
            @focus="crateShowDropdown = true"
            @input="crateShowDropdown = true"
            @blur="hideCrateDropdown"
          />
          <button v-if="crateQuery" class="recipe-clear" @click="clearCrate">clear</button>
          <div v-if="crateShowDropdown && crateFilteredList.length" class="recipe-dropdown">
            <div
              v-for="c in crateFilteredList" :key="c.name + c.location"
              class="recipe-dropdown-item"
              @mousedown.prevent="selectCrate(c)"
            >
              <span class="recipe-dropdown-name">{{ c.name }}</span>
              <span class="hint">{{ c.location || c.region }} · {{ c.basePrice.toLocaleString() }}s</span>
            </div>
          </div>
        </div>

        <!-- From / To locations -->
        <div class="field-row">
          <div class="field">
            <label>Pickup Location</label>
            <select v-model="trade.from" class="region-select" style="width:100%;">
              <option value="">— select —</option>
              <option v-for="loc in PICKUP_LOCATIONS" :key="loc.name" :value="loc.name">{{ loc.name }} ({{ loc.region }})</option>
            </select>
          </div>
          <div class="field">
            <label>Sell Location</label>
            <select v-model="trade.to" class="region-select" style="width:100%;">
              <option value="">— select —</option>
              <option v-for="loc in SELL_LOCATIONS" :key="loc.name" :value="loc.name">{{ loc.name }} ({{ loc.region }})</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Base Price</label>
            <input type="number" v-model.number="trade.basePrice" placeholder="e.g. 197280" />
          </div>
          <div class="field">
            <label>Material Cost Per Unit <span v-if="tradeLoadingMats" class="hint">calculating…</span></label>
            <input type="number" v-model.number="trade.matCost" placeholder="e.g. 30000" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Distance Bonus (%) <span class="hint">max 150 · auto-fills from locations</span></label>
            <input type="number" v-model.number="trade.distanceBonus" min="0" max="150" step="1" placeholder="150" />
          </div>
          <div class="field">
            <label>Quantity</label>
            <input type="number" v-model.number="trade.quantity" min="1" placeholder="1" />
          </div>
        </div>

        <div class="field">
          <label>Trading Level — {{ tradeLevelLabel }} ({{ tradeBargainPct.toFixed(1) }}% bargain)</label>
          <input type="range" v-model.number="trade.levelIndex" min="0" :max="TRADING_LEVELS.length - 1" class="trade-slider" />
        </div>

        <div class="results-card" style="margin-top: 16px;">
          <div v-if="trade.from || trade.to" class="result-row">
            <span>Route</span>
            <span class="val" style="color: #a78bfa;">{{ trade.from || '?' }} → {{ trade.to || '?' }}</span>
          </div>
          <div class="result-row">
            <span>Distance Bonus</span>
            <span class="val" style="color: #60a5fa;">+{{ trade.distanceBonus || 0 }}%</span>
          </div>
          <div class="result-row">
            <span>Bargain Bonus ({{ tradeLevelLabel }})</span>
            <span class="val" style="color: #60a5fa;">+{{ tradeBargainPct.toFixed(1) }}%</span>
          </div>
          <div class="result-row">
            <span>Sell Price Per Unit</span>
            <span class="val" style="color: #f59e0b;">{{ silver(tradeSellPrice) }}</span>
          </div>
          <div class="result-row" :class="tradeProfitPerCrate >= 0 ? '' : 'loss-row'">
            <span>Profit Per Unit</span>
            <span class="val" :class="tradeProfitPerCrate >= 0 ? 'profit' : 'loss'">{{ silver(tradeProfitPerCrate) }}</span>
          </div>
          <div class="result-row highlight" :class="tradeTotalProfit >= 0 ? '' : 'loss-row'">
            <span>Total Profit (x{{ trade.quantity || 1 }})</span>
            <span class="val" :class="tradeTotalProfit >= 0 ? 'profit' : 'loss'">{{ silver(tradeTotalProfit) }}</span>
          </div>
          <div class="result-row">
            <span>ROI</span>
            <span class="val" :class="tradeROI >= 0 ? 'profit' : 'loss'">{{ tradeROI }}%</span>
          </div>
        </div>

        <!-- Save current setup -->
        <div class="trade-save-row">
          <input v-model="savedTradeName" class="trade-save-input" :placeholder="editingIndex >= 0 ? 'Editing: ' + savedTradeName : 'Save setup as...'" @keyup.enter="saveTrade" />
          <button class="btn-save-trade" @click="saveTrade" :disabled="!savedTradeName.trim()">{{ editingIndex >= 0 ? 'Update' : 'Save' }}</button>
          <button v-if="editingIndex >= 0" class="btn-cancel-edit" @click="cancelEdit">Cancel</button>
        </div>

        <!-- Saved trade setups -->
        <div v-if="savedTrades.length" class="saved-trades">
          <h3 class="sub-heading" style="margin-top: 8px;">Saved Setups <span class="hint" v-if="selectedSetups.size">({{ selectedSetups.size }} selected)</span></h3>
          <div v-for="(s, i) in savedTrades" :key="i" class="saved-trade-item" :class="{ 'setup-selected': selectedSetups.has(i), 'setup-editing': editingIndex === i }">
            <label class="setup-checkbox-wrap" @click.stop>
              <input type="checkbox" :checked="selectedSetups.has(i)" @change="toggleSetupSelect(i)" />
            </label>
            <div class="saved-trade-info" style="flex:1; min-width:0;">
              <span class="saved-trade-name">{{ s.name }}</span>
              <span class="hint">{{ s.crateName || 'Custom' }} · {{ (s.basePrice || 0).toLocaleString() }}s · {{ s.from || '?' }} → {{ s.to || '?' }} · x{{ s.quantity || 1 }}</span>
            </div>
            <div class="saved-trade-actions">
              <button class="btn-load-trade" @click="loadSavedTrade(s)">Load</button>
              <button class="btn-load-trade" @click="editSavedTrade(i)" style="color: #f59e0b; border-color: #f59e0b;">Edit</button>
              <button class="btn-del-trade" @click="deleteSavedTrade(i)">×</button>
            </div>
          </div>
        </div>

        <!-- Combined calculation for selected setups -->
        <div v-if="combinedStats" class="results-card" style="margin-top: 16px;">
          <h3 class="sub-heading" style="margin: 0 0 8px; color: #a78bfa;">Combined ({{ combinedStats.count }} setups · {{ combinedStats.totalQuantity }} units)</h3>
          <div class="result-row">
            <span>Total Material Cost</span>
            <span class="val">{{ silver(combinedStats.totalCost) }}</span>
          </div>
          <div class="result-row">
            <span>Total Revenue</span>
            <span class="val" style="color: #f59e0b;">{{ silver(combinedStats.totalRevenue) }}</span>
          </div>
          <div class="result-row highlight" :class="combinedStats.totalProfit >= 0 ? '' : 'loss-row'">
            <span>Total Profit</span>
            <span class="val" :class="combinedStats.totalProfit >= 0 ? 'profit' : 'loss'">{{ silver(combinedStats.totalProfit) }}</span>
          </div>
          <div class="result-row">
            <span>Combined ROI</span>
            <span class="val" :class="combinedStats.totalProfit >= 0 ? 'profit' : 'loss'">{{ combinedStats.roi }}%</span>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f0f0f; color: #e5e5e5; min-height: 100vh; }
input[type="number"] { -moz-appearance: textfield; }
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.app { max-width: 720px; margin: 0 auto; padding: 24px 16px 60px; }

.header { text-align: center; margin-bottom: 24px; }
.header h1 { font-size: 1.8rem; font-weight: 800; color: #fff; }
.subtitle { color: #888; font-size: 0.85rem; margin-top: 4px; }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #1a1a1a; border-radius: 10px; padding: 4px; }
.tab {
  flex: 1; padding: 10px; border: none; background: transparent; color: #888;
  font-size: 0.85rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.tab:hover { color: #ccc; }
.tab.active { background: #2a2a2a; color: #fff; }

.calc-section h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; color: #fff; }

.toggle-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  cursor: pointer; font-size: 0.9rem;
}
.toggle-row input[type="checkbox"] {
  width: 18px; height: 18px; accent-color: #f59e0b; cursor: pointer;
}
.hint { color: #888; font-size: 0.8rem; }
.price-hint { color: #4caf50; font-size: 0.75rem; margin-left: 6px; font-weight: 500; }

.field-row { display: flex; gap: 12px; margin-bottom: 12px; }
.field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 0.75rem; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
.field input, .field select {
  padding: 10px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
  color: #fff; font-size: 0.95rem; transition: border-color 0.2s;
}
.field input:focus, .field select:focus { outline: none; border-color: #f59e0b; }

.sub-heading { font-size: 0.95rem; font-weight: 600; color: #ccc; margin: 16px 0 10px; }

.material-row {
  display: flex; gap: 8px; margin-bottom: 8px; align-items: center;
}
.mat-name { flex: 2; padding: 8px 10px; background: #1a1a1a; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.85rem; }
.mat-cost { flex: 1.5; padding: 8px 10px; background: #1a1a1a; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.85rem; }
.mat-qty { flex: 0.7; padding: 8px 10px; background: #1a1a1a; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.85rem; text-align: center; }
.mat-name:focus, .mat-cost:focus, .mat-qty:focus { outline: none; border-color: #f59e0b; }
.material-row-wrap { margin-bottom: 8px; }
.mat-search-wrap { position: relative; flex: 2; }
.mat-dropdown { top: 100%; left: 0; right: 0; max-height: 200px; }
.mat-remove {
  width: 28px; height: 28px; border: none; background: #7f1d1d; color: #fff;
  border-radius: 6px; cursor: pointer; font-size: 0.85rem; flex-shrink: 0;
}
.mat-remove:hover { background: #991b1b; }
.btn-add-mat {
  padding: 6px 14px; background: transparent; border: 1px dashed #555; color: #888;
  border-radius: 6px; cursor: pointer; font-size: 0.8rem; margin-bottom: 16px;
}
.btn-add-mat:hover { border-color: #f59e0b; color: #f59e0b; }

/* Gathered checkbox */
.gathered-check { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; width: 28px; }
.gathered-check input[type="checkbox"] { accent-color: #4caf50; cursor: pointer; width: 16px; height: 16px; }
.gathered-icon { font-size: 0.75rem; margin-left: 2px; }
.mat-gathered { opacity: 0.45; text-decoration: line-through; }

/* Expand sub-materials button */
.mat-expand {
  width: 28px; height: 28px; border: 1px solid #444; background: #1a1a1a; color: #aaa;
  border-radius: 6px; cursor: pointer; font-size: 0.9rem; flex-shrink: 0; transition: transform 0.2s;
}
.mat-expand:hover { border-color: #f59e0b; color: #f59e0b; }
.mat-expand.active { transform: rotate(180deg); color: #f59e0b; border-color: #f59e0b; }

/* Sub-materials */
.sub-materials {
  margin: 4px 0 12px 36px; padding: 8px 12px; background: #111; border-left: 3px solid #f59e0b33;
  border-radius: 0 8px 8px 0;
}
.sub-mat-header { font-size: 0.75rem; color: #888; margin-bottom: 6px; font-style: italic; }
.sub-material-row { display: flex; gap: 8px; align-items: center; padding: 4px 0; }
.sub-mat-name { flex: 2; font-size: 0.82rem; color: #ddd; }
.sub-mat-cost {
  width: 90px; padding: 4px 8px; background: #1a1a1a; border: 1px solid #333;
  border-radius: 4px; color: #fff; font-size: 0.8rem;
}
.sub-mat-cost:focus { outline: none; border-color: #f59e0b; }
.sub-mat-qty { font-size: 0.8rem; color: #888; min-width: 30px; }
.sub-mat-total { font-size: 0.8rem; color: #4caf50; min-width: 80px; text-align: right; }
.mastery-display { background: #111 !important; color: #f59e0b !important; font-weight: 600; text-align: center; }

.results-card {
  background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 16px; margin-top: 8px;
}
.result-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid #222;
  font-size: 0.9rem;
}
.result-row:last-child { border-bottom: none; }
.result-row.highlight { background: #1e1e1e; margin: 4px -16px; padding: 10px 16px; border-radius: 8px; font-weight: 700; }
.val { font-weight: 700; font-family: 'Consolas', 'Monaco', monospace; }
.profit { color: #22c55e; }
.loss { color: #ef4444; }
.loss-row { background: #1c1111 !important; }

.sim-table-wrap { overflow-x: auto; margin-top: 8px; }
.sim-table {
  width: 100%; border-collapse: collapse; font-size: 0.85rem;
}
.sim-table th {
  text-align: left; padding: 8px 10px; background: #1a1a1a; color: #999;
  font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em;
  border-bottom: 1px solid #333;
}
.sim-table td {
  padding: 8px 10px; border-bottom: 1px solid #1a1a1a; font-family: 'Consolas', 'Monaco', monospace;
}
.sim-table tr:hover { background: #1a1a1a; }

/* ── Recipe Lookup ── */
.recipe-controls {
  display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 12px;
}
.region-select {
  padding: 8px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
  color: #fff; font-size: 0.85rem;
}

.recipe-search-wrap { position: relative; margin-bottom: 12px; }
.recipe-search {
  width: 100%; padding: 12px 14px; background: #1a1a1a; border: 1px solid #333;
  border-radius: 10px; color: #fff; font-size: 1rem; transition: border-color 0.2s;
}
.recipe-search:focus { outline: none; border-color: #f59e0b; }
.recipe-spinner { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #888; font-size: 0.8rem; }
.recipe-clear {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: #333; border: none; color: #ccc; padding: 4px 10px; border-radius: 6px;
  cursor: pointer; font-size: 0.8rem;
}
.recipe-clear:hover { background: #444; }

.recipe-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 100;
  background: #1e1e1e; border: 1px solid #333; border-radius: 0 0 10px 10px;
  max-height: 300px; overflow-y: auto;
}
.recipe-dropdown-item {
  padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between;
  align-items: center; border-bottom: 1px solid #2a2a2a; transition: background 0.15s;
}
.recipe-dropdown-item:hover { background: #2a2a2a; }
.recipe-dropdown-item:last-child { border-bottom: none; }
.recipe-dropdown-name { color: #fff; font-weight: 600; font-size: 0.9rem; }

/* ── Trade Save / Saved Setups ── */
.trade-save-row {
  display: flex; gap: 8px; margin-top: 16px;
}
.trade-save-input {
  flex: 1; padding: 10px 12px; background: #1a1a1a; border: 1px solid #333;
  border-radius: 8px; color: #fff; font-size: 0.9rem;
}
.trade-save-input:focus { outline: none; border-color: #f59e0b; }
.btn-save-trade {
  padding: 10px 18px; background: #f59e0b; border: none; border-radius: 8px;
  color: #000; font-weight: 700; font-size: 0.85rem; cursor: pointer;
}
.btn-save-trade:disabled { opacity: 0.4; cursor: default; }
.btn-save-trade:not(:disabled):hover { background: #fbbf24; }

.saved-trades { margin-top: 4px; }
.saved-trade-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: #1a1a1a; border: 1px solid #2a2a2a;
  border-radius: 8px; margin-bottom: 6px;
}
.saved-trade-info { display: flex; flex-direction: column; gap: 2px; }
.saved-trade-name { font-weight: 600; font-size: 0.9rem; color: #fff; }
.saved-trade-actions { display: flex; gap: 6px; }
.btn-load-trade {
  padding: 6px 14px; background: #2a2a2a; border: 1px solid #444;
  border-radius: 6px; color: #fff; font-size: 0.8rem; cursor: pointer;
}
.btn-load-trade:hover { background: #333; border-color: #f59e0b; color: #f59e0b; }
.btn-del-trade {
  width: 28px; height: 28px; background: #7f1d1d; border: none;
  border-radius: 6px; color: #fff; font-size: 1rem; cursor: pointer; line-height: 1;
}
.btn-del-trade:hover { background: #991b1b; }
.btn-cancel-edit {
  padding: 10px 14px; background: #333; border: 1px solid #555; border-radius: 8px;
  color: #ccc; font-size: 0.85rem; cursor: pointer;
}
.btn-cancel-edit:hover { background: #444; }

.setup-checkbox-wrap {
  display: flex; align-items: center; cursor: pointer; flex-shrink: 0;
}
.setup-checkbox-wrap input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: #a78bfa; cursor: pointer;
}
.setup-selected { border-color: #a78bfa !important; background: #1a1528 !important; }
.setup-editing { border-color: #f59e0b !important; }
.recipe-dropdown-cat { color: #888; font-size: 0.75rem; text-transform: uppercase; }

.recipe-error { color: #ef4444; font-size: 0.85rem; margin: 8px 0; }
.recipe-loading { color: #888; font-size: 0.9rem; padding: 20px 0; text-align: center; }

.recipe-header-info { margin-bottom: 12px; }
.recipe-header-info h3 { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
.recipe-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.recipe-badge {
  background: #2a2a2a; color: #f59e0b; font-size: 0.7rem; font-weight: 700;
  padding: 3px 10px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.04em;
}
.recipe-badge-skill { color: #60a5fa; }

.recipe-results-section { margin-bottom: 8px; }
.recipe-result-row {
  display: flex; align-items: center; gap: 10px; padding: 6px 0;
  font-size: 0.9rem;
}
.recipe-result-name { color: #22c55e; font-weight: 600; }
.recipe-result-qty { color: #888; font-size: 0.8rem; }
.recipe-result-price { color: #f59e0b; font-family: 'Consolas', monospace; font-size: 0.85rem; }

.recipe-mat-list { display: flex; flex-direction: column; gap: 6px; }
.recipe-mat-row {
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
  padding: 8px 12px; background: #161616; border: 1px solid #222; border-radius: 8px;
  flex-wrap: wrap;
}
.recipe-mat-row--gathered { border-color: #1a3a1a; background: #0f1a0f; }
.recipe-mat-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; }
.recipe-source-toggle {
  padding: 3px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer; border: 1px solid;
  transition: all 0.2s; flex-shrink: 0; min-width: 72px; text-align: center;
}
.source-market { background: #1e293b; border-color: #334155; color: #60a5fa; }
.source-market:hover { background: #1e3a5f; border-color: #60a5fa; }
.source-gathered { background: #14532d; border-color: #166534; color: #4ade80; }
.source-gathered:hover { background: #166534; border-color: #4ade80; }
.recipe-mat-name { font-weight: 600; font-size: 0.85rem; }
.recipe-mat-gathered-name { color: #666; text-decoration: line-through; }
.recipe-mat-qty { color: #f59e0b; font-size: 0.8rem; font-weight: 600; flex-shrink: 0; }
.recipe-mat-tag {
  font-size: 0.6rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0;
}
.tag-group { background: #1e3a5f; color: #93c5fd; }
.tag-locked { background: #3f1e1e; color: #fca5a5; }
.tag-npc { background: #3f3a1e; color: #fde68a; }
.tag-craftable { background: #1e2a3f; color: #a78bfa; }

.recipe-expand-btn {
  background: none; border: none; color: #888; cursor: pointer; font-size: 0.75rem;
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: color 0.2s;
}
.recipe-expand-btn:hover { color: #f59e0b; }
.recipe-expand-spacer { width: 20px; flex-shrink: 0; }
.recipe-mat-name--craftable { color: #a78bfa; }

/* Sub-recipe nesting */
.sub-recipe-wrap {
  margin-left: 28px; padding: 8px 0 8px 12px; border-left: 2px solid #2a2a2a;
}
.sub-recipe-loading { color: #888; font-size: 0.8rem; padding: 6px 0; }
.sub-recipe-header {
  font-size: 0.85rem; font-weight: 700; color: #a78bfa; margin-bottom: 6px;
  display: flex; align-items: center; gap: 8px;
}
.sub-recipe-mat-row {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  padding: 5px 10px; background: #131313; border: 1px solid #1e1e1e; border-radius: 6px;
  margin-bottom: 4px; flex-wrap: wrap;
}
.recipe-source-toggle--sm { font-size: 0.6rem; padding: 2px 7px; min-width: 58px; }
.recipe-price-input--sm { width: 100px; font-size: 0.8rem; padding: 4px 8px; }

.recipe-mat-price { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.recipe-price-input {
  width: 120px; padding: 6px 10px; background: #1a1a1a; border: 1px solid #333;
  border-radius: 6px; color: #fff; font-size: 0.85rem; font-family: 'Consolas', monospace;
}
.recipe-price-input:focus { outline: none; border-color: #f59e0b; }
.recipe-mat-line-total { color: #888; font-size: 0.8rem; font-family: 'Consolas', monospace; min-width: 80px; }
.recipe-mat-free { color: #22c55e; font-size: 0.8rem; font-weight: 600; }

.btn-refresh-prices {
  margin-top: 12px; padding: 8px 16px; background: #2a2a2a; border: 1px solid #444;
  color: #ccc; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;
}
.btn-refresh-prices:hover:not(:disabled) { background: #333; border-color: #f59e0b; color: #f59e0b; }
.btn-refresh-prices:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Formula toggle ── */
.formula-toggle { cursor: pointer; user-select: none; transition: color 0.2s; }
.formula-toggle:hover { color: #f59e0b; }
.formula-box {
  background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
  padding: 10px 14px; margin-bottom: 12px; font-family: 'Consolas', monospace;
  color: #f59e0b; font-size: 0.85rem;
}

/* ── Trading slider ── */
.trade-slider {
  width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
  background: #333; border-radius: 3px; outline: none; margin-top: 8px;
}
.trade-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: #f59e0b; cursor: pointer; border: 2px solid #1a1a1a;
}
.trade-slider::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: #f59e0b; cursor: pointer; border: 2px solid #1a1a1a;
}

@media (max-width: 600px) {
  .field-row { flex-direction: column; gap: 8px; }
  .material-row { flex-wrap: wrap; }
  .mat-name { flex-basis: 100%; }
  .header h1 { font-size: 1.4rem; }
  .recipe-mat-row { flex-direction: column; align-items: flex-start; }
  .recipe-mat-price { width: 100%; }
  .recipe-price-input { flex: 1; }
  .recipe-controls { flex-direction: column; }
  .tabs { flex-wrap: wrap; }
}
</style>
