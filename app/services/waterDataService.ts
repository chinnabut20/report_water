interface ApiResponseItem {
    StationName: string;
    PercentStorage: number;
    // Add other fields if needed, but these are the required ones
}

export interface ReservoirData {
    name: string;
    val: number;
}

// This function fetches data from your external JSON API
export const fetchReservoirData = async (): Promise<ReservoirData[]> => {
    try {
        const response = await fetch("https://airvista.soc.cmu.ac.th:3843/cmwater/v1/Water/getReservoirData");

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const json = await response.json();

        // The API returns an object { data: [...] }
        const items: ApiResponseItem[] = json.data || [];

        // Map API data to our internal format
        return items.map((item) => ({
            name: item.StationName,
            val: item.PercentStorage,
        }));

    } catch (error) {
        console.error("Error fetching reservoir data:", error);
        // Return empty array or fallback data in case of error
        return [];
    }
};

interface DamApiResponseItem {
    StationName: string;
    PercentStorage: number;
    TextLevel: string;
}

export interface DamData {
    name: string;
    val: number;
    textLevel: string;
}

export const fetchDamData = async (): Promise<DamData[]> => {
    try {
        const response = await fetch("https://airvista.soc.cmu.ac.th:3843/cmwater/v1/Water/getDamData");

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const json = await response.json();
        const items: DamApiResponseItem[] = json.data || [];

        return items.map((item) => ({
            name: item.StationName,
            val: item.PercentStorage,
            textLevel: item.TextLevel,
        }));
    } catch (error) {
        console.error("Error fetching dam data:", error);
        return [];
    }
};

interface WaterApiResponseItem {
    StationName: string;
    DiffWlBank: string;
    TextLevel: string;
}

export interface WaterData {
    name: string;
    val: string;
    textLevel: string;
}

export const fetchWaterData = async (): Promise<WaterData[]> => {
    try {
        const response = await fetch("https://airvista.soc.cmu.ac.th:3843/cmwater/v1/Water/getWaterData");

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const json = await response.json();
        const items: WaterApiResponseItem[] = json.data || [];

        return items.map((item) => ({
            name: item.StationName,
            val: String(item.DiffWlBank),
            textLevel: item.TextLevel,
        }));
    } catch (error) {
        console.error("Error fetching water data:", error);
        return [];
    }
};

// Mock Data
export const fetchRainfallMockData = async () => {
    try {
        const response = await fetch("/rainfall_mockdata.json");
        return await response.json();
    } catch (error) {
        console.error("Error fetching rainfall mock data:", error);
        return null;
    }
};

export const fetchSoilMoistureMockData = async () => {
    try {
        const response = await fetch("/soil_moisture_mock.json");
        return await response.json();
    } catch (error) {
        console.error("Error fetching soil moisture mock data:", error);
        return null;
    }
};

export const fetchSPEIMockData = async () => {
    try {
        const response = await fetch("/SPEI_mock.json");
        return await response.json();
    } catch (error) {
        console.error("Error fetching SPEI mock data:", error);
        return null;
    }
};
