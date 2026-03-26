<script setup>
import { ref, computed, watch } from 'vue';
import { searchRecipes, fetchRecipe, findRecipeIdByName, preloadRecipeIndex } from './utils/recipes.js';
import { fetchMarketPrice, fetchMarketPrices } from './utils/arsha.js';
import { getMasteryBonus, getBoxSellPrice, getBoxLimit, BOX_TIERS } from './utils/imperial.js';
import { TRADING_LEVELS, getBargainBonus, getCrateSellPrice } from './utils/trading.js';
import RecipeMaterial from './components/RecipeMaterial.vue';

const tab = ref('marketplace');
const recipeIndexReady = ref(false);

// Pre-load recipe index when Recipes tab is first opened
watch(tab, (v) => {
  if (v === 'recipes' && !recipeIndexReady.value) {
    preloadRecipeIndex().then(() => { recipeIndexReady.value = true; });
  }
});

// ─── MARKETPLACE TAX CALCULATOR ──────────────────────────────────────────────
const mp = ref({
  sellPrice: null,
  quantity: 1,
  hasValuePack: true,
});

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

// ─── CRAFTING ROI CALCULATOR ─────────────────────────────────────────────────
const craft = ref({
  sellPrice: null,
  hasValuePack: true,
  materials: [{ name: '', cost: null, qty: 1 }],
  craftsPerSession: 1,
});

const addMaterial = () => craft.value.materials.push({ name: '', cost: null, qty: 1 });
const removeMaterial = (i) => craft.value.materials.splice(i, 1);

const craftTotalMaterialCost = computed(() =>
  craft.value.materials.reduce((sum, m) => sum + (m.cost || 0) * (m.qty || 1), 0)
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
const imp = ref({
  mastery: 0,
  cp: 300,
  tierIndex: 5, // default Guru
  matCostPerBox: null,
});

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
const trade = ref({
  basePrice: null,
  distanceBonus: 150,
  levelIndex: 50, // default ~Artisan 1
  matCost: null,
  quantity: 1,
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
      <button :class="['tab', { active: tab === 'imperial' }]" @click="tab = 'imperial'">Imperial</button>
      <button :class="['tab', { active: tab === 'trading' }]" @click="tab = 'trading'">Trading</button>
    </nav>

    <main class="content">

      <!-- ═══ MARKETPLACE TAX ═══ -->
      <section v-if="tab === 'marketplace'" class="calc-section">
        <h2>Marketplace Tax Calculator</h2>

        <label class="toggle-row">
          <input type="checkbox" v-model="mp.hasValuePack" />
          <span>Value Pack active <span class="hint">({{ mp.hasValuePack ? '15.5%' : '35%' }} tax)</span></span>
        </label>

        <div class="field-row">
          <div class="field">
            <label>Sell Price (per item)</label>
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

        <label class="toggle-row">
          <input type="checkbox" v-model="craft.hasValuePack" />
          <span>Value Pack active <span class="hint">({{ craft.hasValuePack ? '15.5%' : '35%' }} tax)</span></span>
        </label>

        <div class="field-row">
          <div class="field">
            <label>Sell Price (finished item)</label>
            <input type="number" v-model.number="craft.sellPrice" placeholder="e.g. 100000000" />
          </div>
          <div class="field">
            <label>Crafts per session</label>
            <input type="number" v-model.number="craft.craftsPerSession" min="1" placeholder="1" />
          </div>
        </div>

        <h3 class="sub-heading">Materials</h3>
        <div v-for="(m, i) in craft.materials" :key="i" class="material-row">
          <input v-model="m.name" class="mat-name" placeholder="Material name" />
          <input type="number" v-model.number="m.cost" class="mat-cost" placeholder="Cost each" />
          <input type="number" v-model.number="m.qty" class="mat-qty" min="1" placeholder="Qty" />
          <button class="mat-remove" @click="removeMaterial(i)" v-if="craft.materials.length > 1">x</button>
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

        <label class="toggle-row">
          <input type="checkbox" v-model="enhance.hasValuePack" />
          <span>Value Pack active <span class="hint">({{ enhance.hasValuePack ? '15.5%' : '35%' }} tax)</span></span>
        </label>

        <div class="field-row">
          <div class="field">
            <label>Base Item Cost</label>
            <input type="number" v-model.number="enhance.baseItemCost" placeholder="Cost of item to enhance" />
          </div>
          <div class="field">
            <label>Target Sell Price</label>
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
            <label>Cron Stone Cost (each)</label>
            <input type="number" v-model.number="enhance.cronStoneCost" placeholder="0 if not using" />
          </div>
          <div class="field">
            <label>Cron Stones Needed</label>
            <input type="number" v-model.number="enhance.cronStonesNeeded" min="0" placeholder="0" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Repair Cost (per fail)</label>
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

      <!-- ═══ IMPERIAL COOKING ═══ -->
      <section v-if="tab === 'imperial'" class="calc-section">
        <h2>Imperial Cooking Delivery</h2>
        <p class="hint" style="margin-bottom: 12px;">Calculate profit from packaging dishes into imperial cooking boxes and selling to the Imperial NPC. No marketplace tax.</p>

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
            <label>Material Cost Per Box</label>
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
        <h2>Crate Trading Calculator</h2>
        <p class="hint" style="margin-bottom: 12px;">Calculate profit from selling trade crates. Formula: Base Price x (1 + Distance%) x (1 + Bargain%).</p>

        <div class="field-row">
          <div class="field">
            <label>Crate Base Price</label>
            <input type="number" v-model.number="trade.basePrice" placeholder="e.g. 67296" />
          </div>
          <div class="field">
            <label>Material Cost Per Crate</label>
            <input type="number" v-model.number="trade.matCost" placeholder="e.g. 30000" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Distance Bonus (%) <span class="hint">max 150</span></label>
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
          <div class="result-row">
            <span>Distance Bonus</span>
            <span class="val" style="color: #60a5fa;">+{{ trade.distanceBonus || 0 }}%</span>
          </div>
          <div class="result-row">
            <span>Bargain Bonus ({{ tradeLevelLabel }})</span>
            <span class="val" style="color: #60a5fa;">+{{ tradeBargainPct.toFixed(1) }}%</span>
          </div>
          <div class="result-row">
            <span>Sell Price Per Crate</span>
            <span class="val" style="color: #f59e0b;">{{ silver(tradeSellPrice) }}</span>
          </div>
          <div class="result-row" :class="tradeProfitPerCrate >= 0 ? '' : 'loss-row'">
            <span>Profit Per Crate</span>
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
