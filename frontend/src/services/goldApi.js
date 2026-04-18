// services/goldApi.js
export async function fetchAndSaveGoldPrice() {
    const res = await fetch("http://127.0.0.1:8080/api/prices/save", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API returned an error");
    }
    return await res.json()
}

export async function fetchLiveGoldPrice() {
    const res = await fetch("http://127.0.0.1:8080/api/prices/live", {
        headers: {
            "Accept": "application/json"
        }
    })
    if (!res.ok) {
        throw new Error("Failed to fetch live price");
    }
    return await res.json()
}

export async function getLatestPrices() {
    const res = await fetch("http://127.0.0.1:8080/api/prices/latest", {
        headers: {
            "Accept": "application/json"
        }
    })
    if (!res.ok) {
        throw new Error("Failed to get latest prices");
    }
    return await res.json()
}

export async function getLatestForecast() {
    const res = await fetch("http://127.0.0.1:8080/api/prices/forecasts/latest", {
        headers: {
            "Accept": "application/json"
        }
    });
    if (!res.ok) {
        throw new Error("Failed to get latest forecast");
    }
    return await res.json();
}
