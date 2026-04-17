import { useState, useEffect } from "react";
import { getLatestForecast } from "../services/goldApi";

export function useAiForecast() {
    const [aiForecast, setAiForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLatestForecast();
            setAiForecast(data);
        } catch (err) {
            setError(err.message || "Failed to fetch AI forecast.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecast();
    }, []);

    return { aiForecast, loading, error, refreshForecast: fetchForecast };
}
