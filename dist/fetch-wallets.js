const { createObjectCsvWriter } = require("csv-writer");
const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });
// Constants
const API_BASE_URL = "https://api.talentprotocol.com";
const MAX_RETRIES = 3;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 1000; // 1 second
// Validate environment variables
const TALENT_API_KEY = process.env.TALENT_API_KEY;
if (!TALENT_API_KEY) {
    console.error("❌ TALENT_API_KEY is required");
    process.exit(1);
}
/**
 * Sleep utility function
 * @param ms milliseconds to sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Creates an axios instance with default configuration
 */
const createApiClient = () => {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            "X-API-KEY": TALENT_API_KEY,
            "Content-Type": "application/json",
        },
    });
};
/**
 * Fetches wallet address for a given UUID with retry logic
 * @param uuid Talent Protocol profile UUID
 * @returns Wallet address or null if not found
 */
const fetchWalletAddress = async (uuid) => {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    while (retryCount < maxRetries) {
        try {
            const response = await axios.get(`https://api.talentprotocol.com/api/v1/builders/${uuid}`, {
                headers: {
                    Authorization: `Bearer ${TALENT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200 && response.data?.wallet_address) {
                return {
                    uuid,
                    walletAddress: response.data.wallet_address,
                };
            }
            else {
                console.error(`❌ Invalid response for UUID ${uuid}:`, {
                    status: response.status,
                    data: response.data,
                });
                throw new Error("Invalid API response");
            }
        }
        catch (error) {
            lastError = error;
            retryCount++;
            // Log detailed error information
            console.error(`❌ Error fetching wallet for UUID ${uuid} (attempt ${retryCount}/${maxRetries}):`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    return {
        uuid,
        walletAddress: null,
        error: lastError?.message || "Failed to fetch wallet address",
    };
};
/**
 * Process URLs in batches
 * @param urls Array of profile URLs
 * @returns Array of TalentProfile objects
 */
const processUrlBatches = async (urls) => {
    const results = [];
    const batches = [];
    // Create batches
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        batches.push(urls.slice(i, i + BATCH_SIZE));
    }
    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} URLs each`);
    for (const [index, batch] of batches.entries()) {
        console.log(`Processing batch ${index + 1}/${batches.length}`);
        const batchResults = await Promise.all(batch.map(async (url) => {
            const uuid = extractUUID(url);
            if (!uuid) {
                return {
                    uuid: url,
                    walletAddress: null,
                    error: "Invalid URL format",
                };
            }
            return await fetchWalletAddress(uuid);
        }));
        results.push(...batchResults);
        // Don't wait after the last batch
        if (index < batches.length - 1) {
            await sleep(DELAY_BETWEEN_BATCHES);
        }
    }
    return results;
};
/**
 * Extracts UUID from Talent Protocol profile URL
 * @param url Talent Protocol profile URL (e.g., https://app.talentprotocol.com/builderscore/UUID)
 * @returns UUID string or null if URL is invalid
 */
const extractUUID = (url) => {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        const uuid = pathParts[pathParts.length - 1];
        // Validate UUID format (basic check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return null;
        }
        return uuid;
    }
    catch (error) {
        return null;
    }
};
/**
 * Reads URLs from the talent-profiles.md file
 * @returns Array of valid Talent Protocol profile URLs
 */
const readProfileUrls = async () => {
    try {
        const filePath = path.join(process.cwd(), "docs", "talent-profiles.md");
        const content = await fs.readFile(filePath, "utf-8");
        // Extract URLs from markdown file
        const urlRegex = /https:\/\/app\.talentprotocol\.com\/builderscore\/[0-9a-f-]+/g;
        const urls = (content.match(urlRegex) || []);
        return [...new Set(urls)]; // Remove duplicates
    }
    catch (error) {
        console.error("Error reading profile URLs:", error);
        return [];
    }
};
// Updated main function
const main = async () => {
    try {
        const urls = await readProfileUrls();
        console.log(`Found ${urls.length} profile URLs`);
        const results = await processUrlBatches(urls);
        // Log summary
        const successful = results.filter((r) => r.walletAddress).length;
        const failed = results.filter((r) => r.error).length;
        console.log("\nProcessing Summary:");
        console.log(`Total URLs: ${urls.length}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${failed}`);
        // TODO: Implement CSV export
    }
    catch (error) {
        console.error("Script failed:", error);
        process.exit(1);
    }
};
// Run the script
main();
