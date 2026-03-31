// src/hooks/useTrends.js
// Hook React qui gère tous les appels vers l'API FastAPI

import { useState, useEffect } from "react";

const API_BASE = "";

// ── Hook principal ────────────────────────────────────────
export function useTrendingPreview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/trends/preview`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}

// ── Hook pour la page complète avec filtres ───────────────
export function useTrendingAll(category = "all") {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Charge les catégories une seule fois
  useEffect(() => {
    fetch(`${API_BASE}/trends/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Recharge les produits quand la catégorie change
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/trends/all?category=${category}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  return { products, categories, loading, error };
}

export function useClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/trends/clusters`)
      .then((res) => res.json())
      .then((data) => {
        setClusters(data.clusters || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { clusters, loading };
}
