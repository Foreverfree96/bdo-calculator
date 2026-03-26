<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  material: Object,
  materialState: Object,
  subRecipes: Object,
  silver: Function,
  toggleSubRecipe: Function,
  depth: { type: Number, default: 0 },
});
</script>

<template>
  <div>
    <!-- Material row -->
    <div
      class="recipe-mat-row"
      :class="{ 'recipe-mat-row--gathered': materialState[material.itemId]?.source === 'gathered' }"
      :style="{ marginLeft: depth > 0 ? '0' : undefined }"
    >
      <div class="recipe-mat-info">
        <button
          v-if="material.hasRecipe"
          class="recipe-expand-btn"
          @click="toggleSubRecipe(material)"
          :title="subRecipes[material.itemId]?.expanded ? 'Collapse sub-recipe' : 'Expand sub-recipe'"
        >
          {{ subRecipes[material.itemId]?.expanded ? '▼' : '▶' }}
        </button>
        <span v-else class="recipe-expand-spacer"></span>
        <button
          class="recipe-source-toggle"
          :class="[
            materialState[material.itemId]?.source === 'gathered' ? 'source-gathered' : 'source-market',
            depth > 0 ? 'recipe-source-toggle--sm' : ''
          ]"
          @click="materialState[material.itemId] && (materialState[material.itemId].source = materialState[material.itemId].source === 'market' ? 'gathered' : 'market')"
          :title="materialState[material.itemId]?.source === 'gathered' ? 'Self-gathered (free) — click to switch to Market' : 'Bought on Market — click to switch to Self-gathered'"
        >
          {{ materialState[material.itemId]?.source === 'gathered' ? 'Gathered' : 'Market' }}
        </button>
        <span class="recipe-mat-name" :class="{
          'recipe-mat-gathered-name': materialState[material.itemId]?.source === 'gathered',
          'recipe-mat-name--craftable': material.hasRecipe
        }">
          {{ material.name }}
        </span>
        <span class="recipe-mat-qty">x{{ material.qty }}</span>
        <span v-if="material.isGroup" class="recipe-mat-tag tag-group" title="Can be substituted with similar items">sub</span>
        <span v-if="material.isLocked" class="recipe-mat-tag tag-locked" title="Cannot be substituted">fixed</span>
        <span v-if="material.hasRecipe" class="recipe-mat-tag tag-craftable">recipe</span>
      </div>
      <div class="recipe-mat-price">
        <template v-if="materialState[material.itemId]?.source === 'gathered'">
          <span class="recipe-mat-free">Free (self-gathered)</span>
        </template>
        <template v-else>
          <span v-if="materialState[material.itemId]?.priceSource === 'npc'" class="recipe-mat-tag tag-npc">NPC</span>
          <input
            type="number"
            :class="['recipe-price-input', depth > 0 ? 'recipe-price-input--sm' : '']"
            :value="materialState[material.itemId]?.price"
            @input="materialState[material.itemId].price = Number($event.target.value) || null"
            placeholder="Price each"
          />
          <span class="recipe-mat-line-total">
            = {{ silver((materialState[material.itemId]?.price || 0) * material.qty) }}
          </span>
        </template>
      </div>
    </div>

    <!-- Sub-recipe (expanded) — recursive -->
    <div v-if="subRecipes[material.itemId]?.expanded" class="sub-recipe-wrap">
      <div v-if="subRecipes[material.itemId]?.loading" class="sub-recipe-loading">Loading sub-recipe...</div>
      <div v-else-if="subRecipes[material.itemId]?.recipe" class="sub-recipe-content">
        <div class="sub-recipe-header">
          {{ subRecipes[material.itemId].recipe.name }}
          <span v-if="subRecipes[material.itemId].recipe.category" class="recipe-badge" style="font-size:0.6rem;">{{ subRecipes[material.itemId].recipe.category }}</span>
        </div>
        <!-- Recursively render each sub-material -->
        <RecipeMaterial
          v-for="sm in subRecipes[material.itemId].recipe.materials"
          :key="sm.itemId"
          :material="sm"
          :materialState="materialState"
          :subRecipes="subRecipes"
          :silver="silver"
          :toggleSubRecipe="toggleSubRecipe"
          :depth="depth + 1"
        />
      </div>
      <div v-else class="sub-recipe-loading">No recipe found for {{ material.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeMaterial',
};
</script>
