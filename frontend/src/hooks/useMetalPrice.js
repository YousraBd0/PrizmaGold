import { useState, useEffect } from "react";
import { getLatestPrices, fetchAndSaveGoldPrice, fetchLiveGoldPrice } from "../services/goldApi";

export function useMetalPrice() {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshPrices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLatestPrices();
            setPrices(data);
        } catch (err) {
            setError("Failed to fetch latest prices.");
        } finally {
            setLoading(false);
        }
    };

    const fetchNewPrice = async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchAndSaveGoldPrice();  // save to DB
            await refreshPrices();          // ✅ reload full list from DB
        } catch (err) {
            setError(err.message || "Failed to fetch price from API.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveOnly = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchLiveGoldPrice();
            // We just return the data so the component can update its local "live" state
            // without affecting the historical chart prices list.
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch live price.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPrices();
    }, []);

    return { prices, loading, error, refreshPrices, fetchNewPrice, fetchLiveOnly };
}