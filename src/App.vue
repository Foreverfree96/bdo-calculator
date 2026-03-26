<script setup>
import { ref, computed } from 'vue';

const tab = ref('marketplace');

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
  successRate: null, // percentage 0-100
  failstackCost: null, // cost to build the failstack
  cronStoneCost: null, // cost per cron stone (0 if not using)
  cronStonesNeeded: 0, // number of crons per attempt
  repairCost: null, // repair cost on failure (memory fragments etc)
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

// Simulation table
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

        <!-- Simulation Table -->
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
.field input {
  padding: 10px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
  color: #fff; font-size: 0.95rem; transition: border-color 0.2s;
}
.field input:focus { outline: none; border-color: #f59e0b; }

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

@media (max-width: 600px) {
  .field-row { flex-direction: column; gap: 8px; }
  .material-row { flex-wrap: wrap; }
  .mat-name { flex-basis: 100%; }
  .header h1 { font-size: 1.4rem; }
}
</style>
