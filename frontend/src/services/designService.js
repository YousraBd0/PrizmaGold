// services/designService.js
const API_URL = "http://127.0.0.1:8081/api/designs";

export async function saveConfirmedDesign(designData) {
    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(designData)
    });
    
    if (!res.ok) {
        throw new Error("Failed to save design");
    }
    
    return await res.json();
}