// src/hooks/useSearch.js
import { useEffect, useState, useRef } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";

const ALL_CATS = [
  { value: "rice",               label: "Rice" },
  { value: "oil",                label: "Oil" },
  { value: "wheat-flour",        label: "Wheat Flour" },
  { value: "salt",               label: "Salt" },
  { value: "sugar",              label: "Sugar" },
  { value: "chilli-powder",      label: "Chilli Powder" },
  { value: "turmeric-powder",    label: "Turmeric Powder" },
  { value: "pulses",             label: "Pulses" },
  { value: "masala",             label: "Masala" },
  { value: "fruits",             label: "Fruits" },
  { value: "vegetables",         label: "Vegetables" },
  { value: "dairyProducts",      label: "Dairy Products" },
  { value: "feminineHygiene",    label: "Feminine Hygiene" },
  { value: "homeNeeds",          label: "Home Needs" },
  { value: "babyCare",           label: "Baby Care" },
  { value: "instantFood",        label: "Instant Food" },
  { value: "milkPowders",        label: "Milk Powders" },
  { value: "chipsAndNamkeens",   label: "Chips & Namkeens" },
  { value: "oralCare",           label: "Oral Care" },
  { value: "biscuitsAndCookies", label: "Biscuits & Cookies" },
  { value: "coolDrinks",         label: "Cool Drinks" },
  { value: "bodyCare",           label: "Body Care" },
];

// Build the full index once and cache it in module scope
let cachedIndex = null;
let indexPromise = null;

async function buildIndex() {
  if (cachedIndex) return cachedIndex;
  if (indexPromise) return indexPromise;

  indexPromise = Promise.all(
    ALL_CATS.map((cat) =>
      get(ref(database, "categories/" + cat.value)).then((snap) => {
        const val = snap.val();
        if (!val) return [];
        return Object.values(val).map((p, i) => ({
          ...p,
          _cat:   cat.value,
          _catLabel: cat.label,
          _index: i,
          _uid:   `${cat.value}_${i}`,
        }));
      })
    )
  ).then((results) => {
    cachedIndex = { products: results.flat(), categories: ALL_CATS };
    return cachedIndex;
  });

  return indexPromise;
}

// ── Main hook ────────────────────────────────────────────────────────────────
export function useSearch() {
  const [indexReady, setIndexReady] = useState(!!cachedIndex);

  useEffect(() => {
    if (!cachedIndex) {
      buildIndex().then(() => setIndexReady(true));
    }
  }, []);

  /**
   * Returns { categories: [...], products: [...] }
   * - categories: matching category objects  { value, label }
   * - products:   matching product objects   (with _cat, _uid, etc.)
   */
  const search = (query) => {
    if (!cachedIndex || !query || query.trim().length < 1) {
      return { categories: [], products: [] };
    }

    const q = query.trim().toLowerCase();

    const categories = cachedIndex.categories.filter((c) =>
      c.label.toLowerCase().includes(q)
    );

    const products = cachedIndex.products.filter((p) => {
      const name  = (p.name  || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      return name.includes(q) || brand.includes(q);
    }).slice(0, 8); // cap to 8 product suggestions

    return { categories, products };
  };

  return { search, indexReady };
}