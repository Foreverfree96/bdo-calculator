// BDO Processing recipes — comprehensive category-based input→output conversions
// Quantities are per single processing action (base yield before mastery)

export const PROCESSING_CATEGORIES = [
  'Heating', 'Grinding', 'Chopping', 'Drying', 'Filtering', 'Shaking', 'Simple Cooking', 'Simple Alchemy',
];

export const PROCESSING_RECIPES = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // HEATING — Ore → Melted Shard (5 ore → 1-4 shard, avg ~2.5)
  // ═══════════════════════════════════════════════════════════════════════════════
  { category: 'Heating', name: 'Copper Ore → Melted Copper Shard', inputs: [{ name: 'Copper Ore', qty: 5 }], outputs: [{ name: 'Melted Copper Shard', qty: 2 }] },
  { category: 'Heating', name: 'Iron Ore → Melted Iron Shard', inputs: [{ name: 'Iron Ore', qty: 5 }], outputs: [{ name: 'Melted Iron Shard', qty: 2 }] },
  { category: 'Heating', name: 'Tin Ore → Melted Tin Shard', inputs: [{ name: 'Tin Ore', qty: 5 }], outputs: [{ name: 'Melted Tin Shard', qty: 2 }] },
  { category: 'Heating', name: 'Lead Ore → Melted Lead Shard', inputs: [{ name: 'Lead Ore', qty: 5 }], outputs: [{ name: 'Melted Lead Shard', qty: 2 }] },
  { category: 'Heating', name: 'Zinc Ore → Melted Zinc Shard', inputs: [{ name: 'Zinc Ore', qty: 5 }], outputs: [{ name: 'Melted Zinc Shard', qty: 2 }] },
  { category: 'Heating', name: 'Silver Ore → Melted Silver Shard', inputs: [{ name: 'Silver Ore', qty: 5 }], outputs: [{ name: 'Melted Silver Shard', qty: 2 }] },
  { category: 'Heating', name: 'Gold Ore → Melted Gold Shard', inputs: [{ name: 'Gold Ore', qty: 5 }], outputs: [{ name: 'Melted Gold Shard', qty: 2 }] },
  { category: 'Heating', name: 'Platinum Ore → Melted Platinum Shard', inputs: [{ name: 'Platinum Ore', qty: 5 }], outputs: [{ name: 'Melted Platinum Shard', qty: 2 }] },
  { category: 'Heating', name: 'Titanium Ore → Melted Titanium Shard', inputs: [{ name: 'Titanium Ore', qty: 5 }], outputs: [{ name: 'Melted Titanium Shard', qty: 2 }] },
  { category: 'Heating', name: 'Vanadium Ore → Melted Vanadium Shard', inputs: [{ name: 'Vanadium Ore', qty: 5 }], outputs: [{ name: 'Melted Vanadium Shard', qty: 2 }] },
  { category: 'Heating', name: 'Mythril Ore → Melted Mythril Shard', inputs: [{ name: 'Mythril Ore', qty: 5 }], outputs: [{ name: 'Melted Mythril Shard', qty: 2 }] },

  // HEATING — Melted Shard → Ingot (10 shard → 1-4 ingot, avg ~2.5)
  { category: 'Heating', name: 'Melted Copper Shard → Copper Ingot', inputs: [{ name: 'Melted Copper Shard', qty: 10 }], outputs: [{ name: 'Copper Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Iron Shard → Iron Ingot', inputs: [{ name: 'Melted Iron Shard', qty: 10 }], outputs: [{ name: 'Iron Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Tin Shard → Tin Ingot', inputs: [{ name: 'Melted Tin Shard', qty: 10 }], outputs: [{ name: 'Tin Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Lead Shard → Lead Ingot', inputs: [{ name: 'Melted Lead Shard', qty: 10 }], outputs: [{ name: 'Lead Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Zinc Shard → Zinc Ingot', inputs: [{ name: 'Melted Zinc Shard', qty: 10 }], outputs: [{ name: 'Zinc Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Silver Shard → Silver Ingot', inputs: [{ name: 'Melted Silver Shard', qty: 10 }], outputs: [{ name: 'Silver Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Gold Shard → Gold Ingot', inputs: [{ name: 'Melted Gold Shard', qty: 10 }], outputs: [{ name: 'Gold Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Platinum Shard → Platinum Ingot', inputs: [{ name: 'Melted Platinum Shard', qty: 10 }], outputs: [{ name: 'Platinum Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Titanium Shard → Titanium Ingot', inputs: [{ name: 'Melted Titanium Shard', qty: 10 }], outputs: [{ name: 'Titanium Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Vanadium Shard → Vanadium Ingot', inputs: [{ name: 'Melted Vanadium Shard', qty: 10 }], outputs: [{ name: 'Vanadium Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Mythril Shard → Mythril Ingot', inputs: [{ name: 'Melted Mythril Shard', qty: 10 }], outputs: [{ name: 'Mythril Ingot', qty: 2 }] },

  // HEATING — Alloys
  { category: 'Heating', name: 'Brass Ingot (Copper + Zinc)', inputs: [{ name: 'Melted Copper Shard', qty: 5 }, { name: 'Melted Zinc Shard', qty: 5 }], outputs: [{ name: 'Brass Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Bronze Ingot (Copper + Tin)', inputs: [{ name: 'Melted Copper Shard', qty: 5 }, { name: 'Melted Tin Shard', qty: 5 }], outputs: [{ name: 'Bronze Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Steel (Iron + Coal)', inputs: [{ name: 'Melted Iron Shard', qty: 5 }, { name: 'Coal', qty: 5 }], outputs: [{ name: 'Steel', qty: 2 }] },

  // HEATING — Pure Crystals (Skilled heating)
  { category: 'Heating', name: 'Pure Iron Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Iron Ingot', qty: 3 }], outputs: [{ name: 'Pure Iron Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Copper Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Copper Ingot', qty: 3 }], outputs: [{ name: 'Pure Copper Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Lead Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Lead Ingot', qty: 3 }], outputs: [{ name: 'Pure Lead Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Tin Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Tin Ingot', qty: 3 }], outputs: [{ name: 'Pure Tin Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Zinc Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Zinc Ingot', qty: 3 }], outputs: [{ name: 'Pure Zinc Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Silver Crystal', inputs: [{ name: 'Metal Solvent', qty: 1 }, { name: 'Silver Ingot', qty: 3 }], outputs: [{ name: 'Pure Silver Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Gold Crystal', inputs: [{ name: 'Metal Solvent', qty: 1 }, { name: 'Gold Ingot', qty: 3 }], outputs: [{ name: 'Pure Gold Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Platinum Crystal', inputs: [{ name: 'Metal Solvent', qty: 1 }, { name: 'Platinum Ingot', qty: 3 }], outputs: [{ name: 'Pure Platinum Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Mythril Crystal', inputs: [{ name: 'Metal Solvent', qty: 1 }, { name: 'Mythril Ingot', qty: 3 }], outputs: [{ name: 'Pure Mythril Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Titanium Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Titanium Ingot', qty: 3 }], outputs: [{ name: 'Pure Titanium Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Pure Vanadium Crystal', inputs: [{ name: 'Metal Solvent', qty: 2 }, { name: 'Vanadium Ingot', qty: 3 }], outputs: [{ name: 'Pure Vanadium Crystal', qty: 1 }] },

  // HEATING — Sturdy Plywood
  { category: 'Heating', name: 'Sturdy Ash Plywood', inputs: [{ name: 'Ash Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Ash Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Birch Plywood', inputs: [{ name: 'Birch Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Birch Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Cedar Plywood', inputs: [{ name: 'Cedar Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Cedar Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Fir Plywood', inputs: [{ name: 'Fir Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Fir Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Maple Plywood', inputs: [{ name: 'Maple Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Maple Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Pine Plywood', inputs: [{ name: 'Pine Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Pine Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy White Cedar Plywood', inputs: [{ name: 'White Cedar Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy White Cedar Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Acacia Plywood', inputs: [{ name: 'Acacia Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Acacia Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Palm Plywood', inputs: [{ name: 'Palm Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Palm Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Elder Tree Plywood', inputs: [{ name: 'Elder Tree Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Elder Tree Plywood', qty: 1 }] },

  // HEATING — Thread/Yarn
  { category: 'Heating', name: 'Cotton → Cotton Yarn', inputs: [{ name: 'Cotton', qty: 5 }], outputs: [{ name: 'Cotton Yarn', qty: 2 }] },
  { category: 'Heating', name: 'Flax → Flax Thread', inputs: [{ name: 'Flax', qty: 5 }], outputs: [{ name: 'Flax Thread', qty: 2 }] },
  { category: 'Heating', name: 'Fleece → Knitting Yarn', inputs: [{ name: 'Fleece', qty: 5 }], outputs: [{ name: 'Knitting Yarn', qty: 2 }] },
  { category: 'Heating', name: 'Silkworm Cocoon → Silk Thread', inputs: [{ name: 'Silkworm Cocoon', qty: 5 }], outputs: [{ name: 'Silk Thread', qty: 2 }] },

  // HEATING — Gem Crystals
  { category: 'Heating', name: 'Rough Black Crystal → Black Crystal', inputs: [{ name: 'Rough Black Crystal', qty: 5 }], outputs: [{ name: 'Black Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Rough Red Crystal → Red Crystal', inputs: [{ name: 'Rough Red Crystal', qty: 5 }], outputs: [{ name: 'Red Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Rough Blue Crystal → Blue Crystal', inputs: [{ name: 'Rough Blue Crystal', qty: 5 }], outputs: [{ name: 'Blue Crystal', qty: 1 }] },
  { category: 'Heating', name: 'Rough Green Crystal → Green Crystal', inputs: [{ name: 'Rough Green Crystal', qty: 5 }], outputs: [{ name: 'Green Crystal', qty: 1 }] },

  // HEATING — Misc
  { category: 'Heating', name: 'Rough Stone → Black Stone Powder', inputs: [{ name: 'Rough Stone', qty: 2 }], outputs: [{ name: 'Black Stone Powder', qty: 1 }] },
  { category: 'Heating', name: 'Coal → Processed Coal', inputs: [{ name: 'Coal', qty: 5 }], outputs: [{ name: 'Processed Coal', qty: 2 }] },
  { category: 'Heating', name: 'Bottle of River Water → Distilled Water', inputs: [{ name: 'Bottle of River Water', qty: 1 }], outputs: [{ name: 'Distilled Water', qty: 2 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHOPPING — Timber → Plank (5 timber → 1-4 plank, avg ~2.5)
  // ═══════════════════════════════════════════════════════════════════════════════
  { category: 'Chopping', name: 'Ash Timber → Ash Plank', inputs: [{ name: 'Ash Timber', qty: 5 }], outputs: [{ name: 'Ash Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Birch Timber → Birch Plank', inputs: [{ name: 'Birch Timber', qty: 5 }], outputs: [{ name: 'Birch Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Cedar Timber → Cedar Plank', inputs: [{ name: 'Cedar Timber', qty: 5 }], outputs: [{ name: 'Cedar Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Fir Timber → Fir Plank', inputs: [{ name: 'Fir Timber', qty: 5 }], outputs: [{ name: 'Fir Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Maple Timber → Maple Plank', inputs: [{ name: 'Maple Timber', qty: 5 }], outputs: [{ name: 'Maple Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Pine Timber → Pine Plank', inputs: [{ name: 'Pine Timber', qty: 5 }], outputs: [{ name: 'Pine Plank', qty: 2 }] },
  { category: 'Chopping', name: 'White Cedar Timber → White Cedar Plank', inputs: [{ name: 'White Cedar Timber', qty: 5 }], outputs: [{ name: 'White Cedar Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Acacia Timber → Acacia Plank', inputs: [{ name: 'Acacia Timber', qty: 5 }], outputs: [{ name: 'Acacia Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Palm Timber → Palm Plank', inputs: [{ name: 'Palm Timber', qty: 5 }], outputs: [{ name: 'Palm Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Elder Tree Timber → Elder Tree Plank', inputs: [{ name: 'Elder Tree Timber', qty: 5 }], outputs: [{ name: 'Elder Tree Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Thorn Tree Timber → Thorn Tree Plank', inputs: [{ name: 'Thorn Tree Timber', qty: 5 }], outputs: [{ name: 'Thorn Tree Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Snowfield Cedar Timber → Snowfield Cedar Plank', inputs: [{ name: 'Snowfield Cedar Timber', qty: 5 }], outputs: [{ name: 'Snowfield Cedar Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Moss Tree Timber → Moss Tree Plank', inputs: [{ name: 'Moss Tree Timber', qty: 5 }], outputs: [{ name: 'Moss Tree Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Thornwood Timber → Thornwood Plank', inputs: [{ name: 'Thornwood Timber', qty: 5 }], outputs: [{ name: 'Thornwood Plank', qty: 2 }] },

  // CHOPPING — Plank → Plywood (10 plank → 1-4 plywood, avg ~2.5)
  { category: 'Chopping', name: 'Ash Plank → Ash Plywood', inputs: [{ name: 'Ash Plank', qty: 10 }], outputs: [{ name: 'Ash Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Birch Plank → Birch Plywood', inputs: [{ name: 'Birch Plank', qty: 10 }], outputs: [{ name: 'Birch Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Cedar Plank → Cedar Plywood', inputs: [{ name: 'Cedar Plank', qty: 10 }], outputs: [{ name: 'Cedar Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Fir Plank → Fir Plywood', inputs: [{ name: 'Fir Plank', qty: 10 }], outputs: [{ name: 'Fir Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Maple Plank → Maple Plywood', inputs: [{ name: 'Maple Plank', qty: 10 }], outputs: [{ name: 'Maple Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Pine Plank → Pine Plywood', inputs: [{ name: 'Pine Plank', qty: 10 }], outputs: [{ name: 'Pine Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'White Cedar Plank → White Cedar Plywood', inputs: [{ name: 'White Cedar Plank', qty: 10 }], outputs: [{ name: 'White Cedar Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Acacia Plank → Acacia Plywood', inputs: [{ name: 'Acacia Plank', qty: 10 }], outputs: [{ name: 'Acacia Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Palm Plank → Palm Plywood', inputs: [{ name: 'Palm Plank', qty: 10 }], outputs: [{ name: 'Palm Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Elder Tree Plank → Elder Tree Plywood', inputs: [{ name: 'Elder Tree Plank', qty: 10 }], outputs: [{ name: 'Elder Tree Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Thorn Tree Plank → Thorn Tree Plywood', inputs: [{ name: 'Thorn Tree Plank', qty: 10 }], outputs: [{ name: 'Thorn Tree Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Snowfield Cedar Plank → Snowfield Cedar Plywood', inputs: [{ name: 'Snowfield Cedar Plank', qty: 10 }], outputs: [{ name: 'Snowfield Cedar Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Moss Tree Plank → Moss Tree Plywood', inputs: [{ name: 'Moss Tree Plank', qty: 10 }], outputs: [{ name: 'Moss Tree Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Thornwood Plank → Thornwood Plywood', inputs: [{ name: 'Thornwood Plank', qty: 10 }], outputs: [{ name: 'Thornwood Plywood', qty: 2 }] },

  // CHOPPING — Misc
  { category: 'Chopping', name: 'Log → Usable Scantling', inputs: [{ name: 'Log', qty: 10 }], outputs: [{ name: 'Usable Scantling', qty: 2 }] },
  { category: 'Chopping', name: 'Usable Scantling → Standardized Timber Square', inputs: [{ name: 'Usable Scantling', qty: 10 }], outputs: [{ name: 'Standardized Timber Square', qty: 1 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // GRINDING
  // ═══════════════════════════════════════════════════════════════════════════════
  // Grain → Flour
  { category: 'Grinding', name: 'Wheat → Wheat Flour', inputs: [{ name: 'Wheat', qty: 1 }], outputs: [{ name: 'Wheat Flour', qty: 2 }] },
  { category: 'Grinding', name: 'Barley → Barley Flour', inputs: [{ name: 'Barley', qty: 1 }], outputs: [{ name: 'Barley Flour', qty: 2 }] },
  { category: 'Grinding', name: 'Corn → Corn Flour', inputs: [{ name: 'Corn', qty: 1 }], outputs: [{ name: 'Corn Flour', qty: 2 }] },
  { category: 'Grinding', name: 'Potato → Potato Flour', inputs: [{ name: 'Potato', qty: 1 }], outputs: [{ name: 'Potato Flour', qty: 2 }] },
  { category: 'Grinding', name: 'Sweet Potato → Sweet Potato Flour', inputs: [{ name: 'Sweet Potato', qty: 1 }], outputs: [{ name: 'Sweet Potato Flour', qty: 2 }] },
  { category: 'Grinding', name: 'Teff → Teff Flour', inputs: [{ name: 'Teff', qty: 1 }], outputs: [{ name: 'Teff Flour', qty: 2 }] },
  { category: 'Grinding', name: 'Freekeh → Freekeh Flour', inputs: [{ name: 'Freekeh', qty: 1 }], outputs: [{ name: 'Freekeh Flour', qty: 2 }] },

  // Gem Grinding
  { category: 'Grinding', name: 'Rough Ruby → Ruby', inputs: [{ name: 'Rough Ruby', qty: 5 }], outputs: [{ name: 'Ruby', qty: 1 }] },
  { category: 'Grinding', name: 'Rough Sapphire → Sapphire', inputs: [{ name: 'Rough Sapphire', qty: 5 }], outputs: [{ name: 'Sapphire', qty: 1 }] },
  { category: 'Grinding', name: 'Rough Topaz → Topaz', inputs: [{ name: 'Rough Topaz', qty: 5 }], outputs: [{ name: 'Topaz', qty: 1 }] },
  { category: 'Grinding', name: 'Rough Emerald → Emerald', inputs: [{ name: 'Rough Emerald', qty: 5 }], outputs: [{ name: 'Emerald', qty: 1 }] },
  { category: 'Grinding', name: 'Rough Diamond → Diamond', inputs: [{ name: 'Rough Diamond', qty: 5 }], outputs: [{ name: 'Diamond', qty: 1 }] },

  // Fabric Grinding (yarn/thread → fabric)
  { category: 'Grinding', name: 'Cotton Yarn → Cotton Fabric', inputs: [{ name: 'Cotton Yarn', qty: 10 }], outputs: [{ name: 'Cotton Fabric', qty: 2 }] },
  { category: 'Grinding', name: 'Flax Thread → Flax Fabric', inputs: [{ name: 'Flax Thread', qty: 10 }], outputs: [{ name: 'Flax Fabric', qty: 2 }] },
  { category: 'Grinding', name: 'Silk Thread → Silk', inputs: [{ name: 'Silk Thread', qty: 10 }], outputs: [{ name: 'Silk', qty: 2 }] },
  { category: 'Grinding', name: 'Knitting Yarn → Wool', inputs: [{ name: 'Knitting Yarn', qty: 10 }], outputs: [{ name: 'Wool', qty: 2 }] },

  // Misc Grinding
  { category: 'Grinding', name: 'Rough Stone → Polished Stone', inputs: [{ name: 'Rough Stone', qty: 10 }], outputs: [{ name: 'Polished Stone', qty: 1 }] },
  { category: 'Grinding', name: 'Hard Black Crystal Shard → Black Stone (Armor)', inputs: [{ name: 'Hard Black Crystal Shard', qty: 2 }], outputs: [{ name: 'Black Stone (Armor)', qty: 3 }] },
  { category: 'Grinding', name: 'Sharp Black Crystal Shard → Black Stone (Weapon)', inputs: [{ name: 'Sharp Black Crystal Shard', qty: 2 }], outputs: [{ name: 'Black Stone (Weapon)', qty: 3 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // DRYING — Fish (1 fish → 1-4 dried fish)
  // ═══════════════════════════════════════════════════════════════════════════════
  { category: 'Drying', name: 'Carp → Dried Carp', inputs: [{ name: 'Carp', qty: 1 }], outputs: [{ name: 'Dried Carp', qty: 2 }] },
  { category: 'Drying', name: 'Catfish → Dried Catfish', inputs: [{ name: 'Catfish', qty: 1 }], outputs: [{ name: 'Dried Catfish', qty: 2 }] },
  { category: 'Drying', name: 'Trout → Dried Trout', inputs: [{ name: 'Trout', qty: 1 }], outputs: [{ name: 'Dried Trout', qty: 2 }] },
  { category: 'Drying', name: 'Salmon → Dried Salmon', inputs: [{ name: 'Salmon', qty: 1 }], outputs: [{ name: 'Dried Salmon', qty: 2 }] },
  { category: 'Drying', name: 'Bass → Dried Bass', inputs: [{ name: 'Bass', qty: 1 }], outputs: [{ name: 'Dried Bass', qty: 2 }] },
  { category: 'Drying', name: 'Perch → Dried Perch', inputs: [{ name: 'Perch', qty: 1 }], outputs: [{ name: 'Dried Perch', qty: 2 }] },
  { category: 'Drying', name: 'Herring → Dried Herring', inputs: [{ name: 'Herring', qty: 1 }], outputs: [{ name: 'Dried Herring', qty: 2 }] },
  { category: 'Drying', name: 'Mackerel → Dried Mackerel', inputs: [{ name: 'Mackerel', qty: 1 }], outputs: [{ name: 'Dried Mackerel', qty: 2 }] },
  { category: 'Drying', name: 'Sardine → Dried Sardine', inputs: [{ name: 'Sardine', qty: 1 }], outputs: [{ name: 'Dried Sardine', qty: 2 }] },
  { category: 'Drying', name: 'Tuna → Dried Tuna', inputs: [{ name: 'Tuna', qty: 1 }], outputs: [{ name: 'Dried Tuna', qty: 2 }] },
  { category: 'Drying', name: 'Swordfish → Dried Swordfish', inputs: [{ name: 'Swordfish', qty: 1 }], outputs: [{ name: 'Dried Swordfish', qty: 2 }] },
  { category: 'Drying', name: 'Flounder → Dried Flounder', inputs: [{ name: 'Flounder', qty: 1 }], outputs: [{ name: 'Dried Flounder', qty: 2 }] },
  { category: 'Drying', name: 'Flatfish → Dried Flatfish', inputs: [{ name: 'Flatfish', qty: 1 }], outputs: [{ name: 'Dried Flatfish', qty: 2 }] },
  { category: 'Drying', name: 'Squid → Dried Squid', inputs: [{ name: 'Squid', qty: 1 }], outputs: [{ name: 'Dried Squid', qty: 2 }] },
  { category: 'Drying', name: 'Octopus → Dried Octopus', inputs: [{ name: 'Octopus', qty: 1 }], outputs: [{ name: 'Dried Octopus', qty: 2 }] },
  { category: 'Drying', name: 'Cuttlefish → Dried Cuttlefish', inputs: [{ name: 'Cuttlefish', qty: 1 }], outputs: [{ name: 'Dried Cuttlefish', qty: 2 }] },
  { category: 'Drying', name: 'Sea Bass → Dried Sea Bass', inputs: [{ name: 'Sea Bass', qty: 1 }], outputs: [{ name: 'Dried Sea Bass', qty: 2 }] },
  { category: 'Drying', name: 'Sea Eel → Dried Sea Eel', inputs: [{ name: 'Sea Eel', qty: 1 }], outputs: [{ name: 'Dried Sea Eel', qty: 2 }] },
  { category: 'Drying', name: 'Rockfish → Dried Rockfish', inputs: [{ name: 'Rockfish', qty: 1 }], outputs: [{ name: 'Dried Rockfish', qty: 2 }] },
  { category: 'Drying', name: 'Grouper → Dried Grouper', inputs: [{ name: 'Grouper', qty: 1 }], outputs: [{ name: 'Dried Grouper', qty: 2 }] },
  { category: 'Drying', name: 'Croaker → Dried Croaker', inputs: [{ name: 'Croaker', qty: 1 }], outputs: [{ name: 'Dried Croaker', qty: 2 }] },
  { category: 'Drying', name: 'Porgy → Dried Porgy', inputs: [{ name: 'Porgy', qty: 1 }], outputs: [{ name: 'Dried Porgy', qty: 2 }] },
  { category: 'Drying', name: 'Grunt → Dried Grunt', inputs: [{ name: 'Grunt', qty: 1 }], outputs: [{ name: 'Dried Grunt', qty: 2 }] },
  { category: 'Drying', name: 'Bluefish → Dried Bluefish', inputs: [{ name: 'Bluefish', qty: 1 }], outputs: [{ name: 'Dried Bluefish', qty: 2 }] },
  { category: 'Drying', name: 'Pomfret → Dried Pomfret', inputs: [{ name: 'Pomfret', qty: 1 }], outputs: [{ name: 'Dried Pomfret', qty: 2 }] },
  { category: 'Drying', name: 'Snakehead → Dried Snakehead', inputs: [{ name: 'Snakehead', qty: 1 }], outputs: [{ name: 'Dried Snakehead', qty: 2 }] },
  { category: 'Drying', name: 'Smelt → Dried Smelt', inputs: [{ name: 'Smelt', qty: 1 }], outputs: [{ name: 'Dried Smelt', qty: 2 }] },
  { category: 'Drying', name: 'Beltfish → Dried Beltfish', inputs: [{ name: 'Beltfish', qty: 1 }], outputs: [{ name: 'Dried Beltfish', qty: 2 }] },
  { category: 'Drying', name: 'Filefish → Dried Filefish', inputs: [{ name: 'Filefish', qty: 1 }], outputs: [{ name: 'Dried Filefish', qty: 2 }] },
  { category: 'Drying', name: 'Mullet → Dried Mullet', inputs: [{ name: 'Mullet', qty: 1 }], outputs: [{ name: 'Dried Mullet', qty: 2 }] },
  { category: 'Drying', name: 'Ray → Dried Ray', inputs: [{ name: 'Ray', qty: 1 }], outputs: [{ name: 'Dried Ray', qty: 2 }] },
  { category: 'Drying', name: 'Crab → Dried Crab', inputs: [{ name: 'Crab', qty: 1 }], outputs: [{ name: 'Dried Crab', qty: 2 }] },
  { category: 'Drying', name: 'Jellyfish → Dried Jellyfish', inputs: [{ name: 'Jellyfish', qty: 1 }], outputs: [{ name: 'Dried Jellyfish', qty: 2 }] },
  { category: 'Drying', name: 'Starfish → Dried Starfish', inputs: [{ name: 'Starfish', qty: 1 }], outputs: [{ name: 'Dried Starfish', qty: 2 }] },
  { category: 'Drying', name: 'Seahorse → Dried Seahorse', inputs: [{ name: 'Seahorse', qty: 1 }], outputs: [{ name: 'Dried Seahorse', qty: 2 }] },
  { category: 'Drying', name: 'Shellfish → Dried Shellfish', inputs: [{ name: 'Shellfish', qty: 1 }], outputs: [{ name: 'Dried Shellfish', qty: 2 }] },
  { category: 'Drying', name: 'Clownfish → Dried Clownfish', inputs: [{ name: 'Clownfish', qty: 1 }], outputs: [{ name: 'Dried Clownfish', qty: 2 }] },
  { category: 'Drying', name: 'Blue Tang → Dried Blue Tang', inputs: [{ name: 'Blue Tang', qty: 1 }], outputs: [{ name: 'Dried Blue Tang', qty: 2 }] },
  { category: 'Drying', name: 'Angler → Dried Angler', inputs: [{ name: 'Angler', qty: 1 }], outputs: [{ name: 'Dried Angler', qty: 2 }] },
  { category: 'Drying', name: 'Skipjack → Dried Skipjack', inputs: [{ name: 'Skipjack', qty: 1 }], outputs: [{ name: 'Dried Skipjack', qty: 2 }] },
  { category: 'Drying', name: 'Sunfish → Dried Sunfish', inputs: [{ name: 'Sunfish', qty: 1 }], outputs: [{ name: 'Dried Sunfish', qty: 2 }] },
  { category: 'Drying', name: 'Flying Fish → Dried Flying Fish', inputs: [{ name: 'Flying Fish', qty: 1 }], outputs: [{ name: 'Dried Flying Fish', qty: 2 }] },
  { category: 'Drying', name: 'Gurnard → Dried Gurnard', inputs: [{ name: 'Gurnard', qty: 1 }], outputs: [{ name: 'Dried Gurnard', qty: 2 }] },
  { category: 'Drying', name: 'Dolphinfish → Dried Dolphinfish', inputs: [{ name: 'Dolphinfish', qty: 1 }], outputs: [{ name: 'Dried Dolphinfish', qty: 2 }] },
  { category: 'Drying', name: 'John Dory → Dried John Dory', inputs: [{ name: 'John Dory', qty: 1 }], outputs: [{ name: 'Dried John Dory', qty: 2 }] },
  { category: 'Drying', name: 'Greenling → Dried Greenling', inputs: [{ name: 'Greenling', qty: 1 }], outputs: [{ name: 'Dried Greenling', qty: 2 }] },
  { category: 'Drying', name: 'Tilefish → Dried Tilefish', inputs: [{ name: 'Tilefish', qty: 1 }], outputs: [{ name: 'Dried Tilefish', qty: 2 }] },
  { category: 'Drying', name: 'Saurel → Dried Saurel', inputs: [{ name: 'Saurel', qty: 1 }], outputs: [{ name: 'Dried Saurel', qty: 2 }] },
  { category: 'Drying', name: 'Amberjack → Dried Amberjack', inputs: [{ name: 'Amberjack', qty: 1 }], outputs: [{ name: 'Dried Amberjack', qty: 2 }] },
  { category: 'Drying', name: 'Sturgeon → Dried Sturgeon', inputs: [{ name: 'Sturgeon', qty: 1 }], outputs: [{ name: 'Dried Sturgeon', qty: 2 }] },
  { category: 'Drying', name: 'Freshwater Eel → Dried Freshwater Eel', inputs: [{ name: 'Freshwater Eel', qty: 1 }], outputs: [{ name: 'Dried Freshwater Eel', qty: 2 }] },
  { category: 'Drying', name: 'Arowana → Dried Arowana', inputs: [{ name: 'Arowana', qty: 1 }], outputs: [{ name: 'Dried Arowana', qty: 2 }] },
  { category: 'Drying', name: 'Lenok → Dried Lenok', inputs: [{ name: 'Lenok', qty: 1 }], outputs: [{ name: 'Dried Lenok', qty: 2 }] },
  { category: 'Drying', name: 'Sweetfish → Dried Sweetfish', inputs: [{ name: 'Sweetfish', qty: 1 }], outputs: [{ name: 'Dried Sweetfish', qty: 2 }] },
  { category: 'Drying', name: 'Crawfish → Dried Crawfish', inputs: [{ name: 'Crawfish', qty: 1 }], outputs: [{ name: 'Dried Crawfish', qty: 2 }] },
  { category: 'Drying', name: 'Mudfish → Dried Mudfish', inputs: [{ name: 'Mudfish', qty: 1 }], outputs: [{ name: 'Dried Mudfish', qty: 2 }] },
  { category: 'Drying', name: 'Crucian Carp → Dried Crucian Carp', inputs: [{ name: 'Crucian Carp', qty: 1 }], outputs: [{ name: 'Dried Crucian Carp', qty: 2 }] },
  { category: 'Drying', name: 'Cherry Salmon → Dried Cherry Salmon', inputs: [{ name: 'Cherry Salmon', qty: 1 }], outputs: [{ name: 'Dried Cherry Salmon', qty: 2 }] },
  { category: 'Drying', name: 'Piranha → Dried Piranha', inputs: [{ name: 'Piranha', qty: 1 }], outputs: [{ name: 'Dried Piranha', qty: 2 }] },
  { category: 'Drying', name: 'Pacu → Dried Pacu', inputs: [{ name: 'Pacu', qty: 1 }], outputs: [{ name: 'Dried Pacu', qty: 2 }] },
  { category: 'Drying', name: 'Pintado → Dried Pintado', inputs: [{ name: 'Pintado', qty: 1 }], outputs: [{ name: 'Dried Pintado', qty: 2 }] },
  { category: 'Drying', name: 'Swellfish → Dried Swellfish', inputs: [{ name: 'Swellfish', qty: 1 }], outputs: [{ name: 'Dried Swellfish', qty: 2 }] },
  { category: 'Drying', name: 'Moray → Dried Moray', inputs: [{ name: 'Moray', qty: 1 }], outputs: [{ name: 'Dried Moray', qty: 2 }] },

  // DRYING — Hides
  { category: 'Drying', name: 'Deer Hide → Soft Hide', inputs: [{ name: 'Deer Hide', qty: 5 }], outputs: [{ name: 'Soft Hide', qty: 2 }] },
  { category: 'Drying', name: 'Sheep Hide → Soft Hide', inputs: [{ name: 'Sheep Hide', qty: 5 }], outputs: [{ name: 'Soft Hide', qty: 2 }] },
  { category: 'Drying', name: 'Fox Hide → Soft Hide', inputs: [{ name: 'Fox Hide', qty: 5 }], outputs: [{ name: 'Soft Hide', qty: 2 }] },
  { category: 'Drying', name: 'Rhino Hide → Tough Hide', inputs: [{ name: 'Rhino Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 2 }] },
  { category: 'Drying', name: 'Pig Hide → Tough Hide', inputs: [{ name: 'Pig Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 2 }] },
  { category: 'Drying', name: 'Ox Hide → Tough Hide', inputs: [{ name: 'Ox Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 2 }] },
  { category: 'Drying', name: 'Bear Hide → Thick Fur', inputs: [{ name: 'Bear Hide', qty: 5 }], outputs: [{ name: 'Thick Fur', qty: 2 }] },
  { category: 'Drying', name: 'Wolf Hide → Thick Fur', inputs: [{ name: 'Wolf Hide', qty: 5 }], outputs: [{ name: 'Thick Fur', qty: 2 }] },
  { category: 'Drying', name: 'Lion Hide → Thick Fur', inputs: [{ name: 'Lion Hide', qty: 5 }], outputs: [{ name: 'Thick Fur', qty: 2 }] },
  { category: 'Drying', name: 'Lizard Hide → Hard Hide', inputs: [{ name: 'Lizard Hide', qty: 5 }], outputs: [{ name: 'Hard Hide', qty: 2 }] },
  { category: 'Drying', name: 'Worm Hide → Hard Hide', inputs: [{ name: 'Worm Hide', qty: 5 }], outputs: [{ name: 'Hard Hide', qty: 2 }] },
  { category: 'Drying', name: 'Weasel Hide → Thin Hide', inputs: [{ name: 'Weasel Hide', qty: 5 }], outputs: [{ name: 'Thin Hide', qty: 2 }] },
  { category: 'Drying', name: 'Raccoon Hide → Thin Hide', inputs: [{ name: 'Raccoon Hide', qty: 5 }], outputs: [{ name: 'Thin Hide', qty: 2 }] },
  { category: 'Drying', name: 'Waragon Hide → Fancy Fur', inputs: [{ name: 'Waragon Hide', qty: 5 }], outputs: [{ name: 'Fancy Fur', qty: 2 }] },
  { category: 'Drying', name: 'Cheetah Dragon Hide → Fancy Fur', inputs: [{ name: 'Cheetah Dragon Hide', qty: 5 }], outputs: [{ name: 'Fancy Fur', qty: 2 }] },

  // DRYING — Fine Hides (10 base → fine)
  { category: 'Drying', name: 'Soft Hide → Fine Soft Hide', inputs: [{ name: 'Soft Hide', qty: 10 }], outputs: [{ name: 'Fine Soft Hide', qty: 1 }] },
  { category: 'Drying', name: 'Tough Hide → Fine Tough Hide', inputs: [{ name: 'Tough Hide', qty: 10 }], outputs: [{ name: 'Fine Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Thick Fur → Fine Thick Fur', inputs: [{ name: 'Thick Fur', qty: 10 }], outputs: [{ name: 'Fine Thick Fur', qty: 1 }] },
  { category: 'Drying', name: 'Hard Hide → Fine Hard Hide', inputs: [{ name: 'Hard Hide', qty: 10 }], outputs: [{ name: 'Fine Hard Hide', qty: 1 }] },
  { category: 'Drying', name: 'Thin Hide → Fine Thin Hide', inputs: [{ name: 'Thin Hide', qty: 10 }], outputs: [{ name: 'Fine Thin Hide', qty: 1 }] },
  { category: 'Drying', name: 'Fancy Fur → Fine Fancy Fur', inputs: [{ name: 'Fancy Fur', qty: 10 }], outputs: [{ name: 'Fine Fancy Fur', qty: 1 }] },

  // DRYING — Meat
  { category: 'Drying', name: 'Deer Meat → Rare Jerky', inputs: [{ name: 'Deer Meat', qty: 1 }], outputs: [{ name: 'Rare Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Pork → Rare Jerky', inputs: [{ name: 'Pork', qty: 1 }], outputs: [{ name: 'Rare Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Beef → Rare Jerky', inputs: [{ name: 'Beef', qty: 1 }], outputs: [{ name: 'Rare Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Fox Meat → Fragrant Jerky', inputs: [{ name: 'Fox Meat', qty: 1 }], outputs: [{ name: 'Fragrant Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Bear Meat → Fragrant Jerky', inputs: [{ name: 'Bear Meat', qty: 1 }], outputs: [{ name: 'Fragrant Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Wolf Meat → Fragrant Jerky', inputs: [{ name: 'Wolf Meat', qty: 1 }], outputs: [{ name: 'Fragrant Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Weasel Meat → Fragrant Jerky', inputs: [{ name: 'Weasel Meat', qty: 1 }], outputs: [{ name: 'Fragrant Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Lamb Meat → Well-Dried Jerky', inputs: [{ name: 'Lamb Meat', qty: 1 }], outputs: [{ name: 'Well-Dried Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Lizard Meat → Well-Dried Jerky', inputs: [{ name: 'Lizard Meat', qty: 1 }], outputs: [{ name: 'Well-Dried Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Kuku Bird Meat → Well-Dried Jerky', inputs: [{ name: 'Kuku Bird Meat', qty: 1 }], outputs: [{ name: 'Well-Dried Jerky', qty: 2 }] },
  { category: 'Drying', name: 'Flamingo Meat → Well-Dried Jerky', inputs: [{ name: 'Flamingo Meat', qty: 1 }], outputs: [{ name: 'Well-Dried Jerky', qty: 2 }] },

  // DRYING — Cheese
  { category: 'Drying', name: 'Milk → Cheese', inputs: [{ name: 'Milk', qty: 1 }], outputs: [{ name: 'Cheese', qty: 2 }] },

  // DRYING — Crops → Fertilizer
  { category: 'Drying', name: 'Wheat → Inorganic Fertilizer', inputs: [{ name: 'Wheat', qty: 5 }], outputs: [{ name: 'Inorganic Fertilizer', qty: 1 }] },
  { category: 'Drying', name: 'Barley → Inorganic Fertilizer', inputs: [{ name: 'Barley', qty: 5 }], outputs: [{ name: 'Inorganic Fertilizer', qty: 1 }] },
  { category: 'Drying', name: 'Potato → Inorganic Fertilizer', inputs: [{ name: 'Potato', qty: 5 }], outputs: [{ name: 'Inorganic Fertilizer', qty: 1 }] },
  { category: 'Drying', name: 'Sweet Potato → Inorganic Fertilizer', inputs: [{ name: 'Sweet Potato', qty: 5 }], outputs: [{ name: 'Inorganic Fertilizer', qty: 1 }] },
  { category: 'Drying', name: 'Corn → Inorganic Fertilizer', inputs: [{ name: 'Corn', qty: 5 }], outputs: [{ name: 'Inorganic Fertilizer', qty: 1 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILTERING
  // ═══════════════════════════════════════════════════════════════════════════════
  { category: 'Filtering', name: 'Cotton → Cotton Fabric', inputs: [{ name: 'Cotton', qty: 5 }], outputs: [{ name: 'Cotton Fabric', qty: 1 }] },
  { category: 'Filtering', name: 'Flax → Flax Fabric', inputs: [{ name: 'Flax', qty: 5 }], outputs: [{ name: 'Flax Fabric', qty: 1 }] },
  { category: 'Filtering', name: 'Wool → Wool Fabric', inputs: [{ name: 'Wool', qty: 5 }], outputs: [{ name: 'Wool Fabric', qty: 1 }] },
  { category: 'Filtering', name: 'Silk → Silk Thread', inputs: [{ name: 'Silk', qty: 5 }], outputs: [{ name: 'Silk Thread', qty: 1 }] },
  { category: 'Filtering', name: 'Fleece → Wool', inputs: [{ name: 'Fleece', qty: 5 }], outputs: [{ name: 'Wool', qty: 1 }] },
  { category: 'Filtering', name: 'River Water → Purified Water', inputs: [{ name: 'Bottle of River Water', qty: 1 }], outputs: [{ name: 'Purified Water', qty: 2 }] },
  { category: 'Filtering', name: 'Muddy Water → Purified Water', inputs: [{ name: 'Bag of Muddy Water', qty: 5 }], outputs: [{ name: 'Purified Water', qty: 2 }] },
  { category: 'Filtering', name: 'Cactus Sap → Purified Water', inputs: [{ name: 'Cactus Sap', qty: 5 }], outputs: [{ name: 'Purified Water', qty: 2 }] },
  { category: 'Filtering', name: 'Lightweight Plume → Fine Lightweight Plume', inputs: [{ name: 'Lightweight Plume', qty: 10 }], outputs: [{ name: 'Fine Lightweight Plume', qty: 1 }] },
  { category: 'Filtering', name: 'Fancy Feather → Fine Fancy Feather', inputs: [{ name: 'Fancy Feather', qty: 10 }], outputs: [{ name: 'Fine Fancy Feather', qty: 1 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SHAKING
  // ═══════════════════════════════════════════════════════════════════════════════
  // Dough
  { category: 'Shaking', name: 'Wheat Flour + Water → Wheat Dough', inputs: [{ name: 'Wheat Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Wheat Dough', qty: 2 }] },
  { category: 'Shaking', name: 'Barley Flour + Water → Barley Dough', inputs: [{ name: 'Barley Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Barley Dough', qty: 2 }] },
  { category: 'Shaking', name: 'Corn Flour + Water → Corn Dough', inputs: [{ name: 'Corn Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Corn Dough', qty: 2 }] },
  { category: 'Shaking', name: 'Potato Flour + Water → Potato Dough', inputs: [{ name: 'Potato Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Potato Dough', qty: 2 }] },
  { category: 'Shaking', name: 'Sweet Potato Flour + Water → Sweet Potato Dough', inputs: [{ name: 'Sweet Potato Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Sweet Potato Dough', qty: 2 }] },
  { category: 'Shaking', name: 'Teff Flour + Water → Teff Dough', inputs: [{ name: 'Teff Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Teff Flour Dough', qty: 2 }] },
  { category: 'Shaking', name: 'Freekeh Flour + Water → Freekeh Dough', inputs: [{ name: 'Freekeh Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Freekeh Flour Dough', qty: 2 }] },

  // Dairy
  { category: 'Shaking', name: 'Milk + Sugar → Cream', inputs: [{ name: 'Milk', qty: 1 }, { name: 'Sugar', qty: 1 }], outputs: [{ name: 'Cream', qty: 2 }] },
  { category: 'Shaking', name: 'Cream + Salt → Butter', inputs: [{ name: 'Cream', qty: 1 }, { name: 'Salt', qty: 1 }], outputs: [{ name: 'Butter', qty: 2 }] },

  // Fertilizer
  { category: 'Shaking', name: 'Inorganic Fertilizer → Byproduct Fertilizer', inputs: [{ name: 'Inorganic Fertilizer', qty: 3 }, { name: 'Leavening Agent', qty: 2 }], outputs: [{ name: 'Byproduct Fertilizer', qty: 1 }] },
  { category: 'Shaking', name: 'Byproduct Fertilizer → Organic Fertilizer', inputs: [{ name: 'Byproduct Fertilizer', qty: 1 }, { name: 'Purified Water', qty: 2 }], outputs: [{ name: 'Organic Fertilizer', qty: 1 }] },

  // Supreme Hides
  { category: 'Shaking', name: 'Fine Soft Hide → Supreme Soft Hide', inputs: [{ name: 'Fine Soft Hide', qty: 3 }, { name: 'Leather Glaze', qty: 5 }], outputs: [{ name: 'Supreme Soft Hide', qty: 1 }] },
  { category: 'Shaking', name: 'Fine Tough Hide → Supreme Tough Hide', inputs: [{ name: 'Fine Tough Hide', qty: 3 }, { name: 'Leather Glaze', qty: 5 }], outputs: [{ name: 'Supreme Tough Hide', qty: 1 }] },
  { category: 'Shaking', name: 'Fine Thick Fur → Supreme Thick Fur', inputs: [{ name: 'Fine Thick Fur', qty: 3 }, { name: 'Leather Glaze', qty: 5 }], outputs: [{ name: 'Supreme Thick Fur', qty: 1 }] },
  { category: 'Shaking', name: 'Fine Hard Hide → Supreme Hard Hide', inputs: [{ name: 'Fine Hard Hide', qty: 3 }, { name: 'Leather Glaze', qty: 5 }], outputs: [{ name: 'Supreme Hard Hide', qty: 1 }] },
  { category: 'Shaking', name: 'Fine Thin Hide → Supreme Thin Hide', inputs: [{ name: 'Fine Thin Hide', qty: 3 }, { name: 'Leather Glaze', qty: 5 }], outputs: [{ name: 'Supreme Thin Hide', qty: 1 }] },
  { category: 'Shaking', name: 'Fine Fancy Fur → Supreme Fancy Fur', inputs: [{ name: 'Fine Fancy Fur', qty: 3 }, { name: 'Leather Glaze', qty: 5 }], outputs: [{ name: 'Supreme Fancy Fur', qty: 1 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SIMPLE COOKING
  // ═══════════════════════════════════════════════════════════════════════════════
  { category: 'Simple Cooking', name: 'Grain + Water → Grain Juice', inputs: [{ name: 'Wheat', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Grain Juice', qty: 10 }] },
  { category: 'Simple Cooking', name: 'Barley + Water → Grain Juice', inputs: [{ name: 'Barley', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Grain Juice', qty: 10 }] },
  { category: 'Simple Cooking', name: 'Potato + Water → Grain Juice', inputs: [{ name: 'Potato', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Grain Juice', qty: 10 }] },
  { category: 'Simple Cooking', name: 'Corn + Water → Grain Juice', inputs: [{ name: 'Corn', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Grain Juice', qty: 10 }] },
  { category: 'Simple Cooking', name: 'Sweet Potato + Water → Grain Juice', inputs: [{ name: 'Sweet Potato', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Grain Juice', qty: 10 }] },
  { category: 'Simple Cooking', name: 'Grain Juice → Concentrated Grain Juice', inputs: [{ name: 'Grain Juice', qty: 3 }], outputs: [{ name: 'Concentrated Grain Juice', qty: 1 }] },
  { category: 'Simple Cooking', name: 'Concentrated → Highly Concentrated Grain Juice', inputs: [{ name: 'Concentrated Grain Juice', qty: 3 }], outputs: [{ name: 'Highly Concentrated Grain Juice', qty: 1 }] },
  { category: 'Simple Cooking', name: 'Highly Concentrated → Refined Grain Juice', inputs: [{ name: 'Highly Concentrated Grain Juice', qty: 3 }], outputs: [{ name: 'Refined Grain Juice', qty: 1 }] },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SIMPLE ALCHEMY
  // ═══════════════════════════════════════════════════════════════════════════════
  { category: 'Simple Alchemy', name: 'Herb + Water → Herbal Juice', inputs: [{ name: 'Sunrise Herb', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Herbal Juice', qty: 10 }] },
  { category: 'Simple Alchemy', name: 'Silver Azalea + Water → Herbal Juice', inputs: [{ name: 'Silver Azalea', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Herbal Juice', qty: 10 }] },
  { category: 'Simple Alchemy', name: 'Fire Flake Flower + Water → Herbal Juice', inputs: [{ name: 'Fire Flake Flower', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Herbal Juice', qty: 10 }] },
  { category: 'Simple Alchemy', name: 'Dry Mane Grass + Water → Herbal Juice', inputs: [{ name: 'Dry Mane Grass', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Herbal Juice', qty: 10 }] },
  { category: 'Simple Alchemy', name: 'Silk Honey Grass + Water → Herbal Juice', inputs: [{ name: 'Silk Honey Grass', qty: 3 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Herbal Juice', qty: 10 }] },
  { category: 'Simple Alchemy', name: 'Herbal Juice → Concentrated Herbal Juice', inputs: [{ name: 'Herbal Juice', qty: 3 }], outputs: [{ name: 'Concentrated Herbal Juice', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'Concentrated → Highly Concentrated Herbal Juice', inputs: [{ name: 'Concentrated Herbal Juice', qty: 3 }], outputs: [{ name: 'Highly Concentrated Herbal Juice', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'HP Potion (Small) → HP Potion (Medium)', inputs: [{ name: 'HP Potion (Small)', qty: 3 }], outputs: [{ name: 'HP Potion (Medium)', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'HP Potion (Medium) → HP Potion (Large)', inputs: [{ name: 'HP Potion (Medium)', qty: 3 }], outputs: [{ name: 'HP Potion (Large)', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'HP Potion (Large) → HP Potion (Extra Large)', inputs: [{ name: 'HP Potion (Large)', qty: 3 }], outputs: [{ name: 'HP Potion (Extra Large)', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'MP Potion (Small) → MP Potion (Medium)', inputs: [{ name: 'MP Potion (Small)', qty: 3 }], outputs: [{ name: 'MP Potion (Medium)', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'MP Potion (Medium) → MP Potion (Large)', inputs: [{ name: 'MP Potion (Medium)', qty: 3 }], outputs: [{ name: 'MP Potion (Large)', qty: 1 }] },
  { category: 'Simple Alchemy', name: 'MP Potion (Large) → MP Potion (Extra Large)', inputs: [{ name: 'MP Potion (Large)', qty: 3 }], outputs: [{ name: 'MP Potion (Extra Large)', qty: 1 }] },
];
