#!/usr/bin/env tsx
/**
 * Test script for Talent Protocol API integration
 * 
 * Usage: tsx scripts/test-talent-api.ts [address]
 * 
 * If no address is provided, uses a test address
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
// Also try .env as fallback
dotenv.config({ path: resolve(process.cwd(), ".env") });

const TALENT_API_KEY = process.env.TALENT_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Test address - you can replace this with any builder address from your registry
const TEST_ADDRESS = process.argv[2] || "0x324e9E13dd19528D0F390201923d17c4B7E94462";

async function testTalentAPI() {
  console.log("🧪 Testing Talent Protocol API Integration\n");
  console.log("=" .repeat(50));

  // 1. Check API key
  console.log("\n1️⃣ Checking API Key Configuration:");
  if (!TALENT_API_KEY) {
    console.error("❌ TALENT_API_KEY is not set in environment variables");
    console.log("   Make sure .env.local exists with TALENT_API_KEY");
    process.exit(1);
  }
  console.log(`✅ API Key found (length: ${TALENT_API_KEY.length})`);

  // 2. Test Score API
  console.log("\n2️⃣ Testing Talent Score API:");
  try {
    const scoreUrl = `${BASE_URL}/api/talent?address=${TEST_ADDRESS}`;
    console.log(`   Fetching: ${scoreUrl}`);
    
    const scoreResponse = await fetch(scoreUrl);
    const scoreData = await scoreResponse.json();
    
    if (scoreResponse.ok && scoreData.score) {
      console.log(`✅ Score API working!`);
      console.log(`   Address: ${TEST_ADDRESS}`);
      console.log(`   Score: ${scoreData.score.points || "N/A"}`);
    } else if (scoreResponse.ok && Object.keys(scoreData).length === 0) {
      console.log(`⚠️  No score data for this address (this is normal if address doesn't have Talent Protocol profile)`);
    } else {
      console.error(`❌ Score API error:`, scoreData);
    }
  } catch (error) {
    console.error(`❌ Score API failed:`, error);
  }

  // 3. Test Profile API
  console.log("\n3️⃣ Testing Talent Profile API:");
  try {
    const profileUrl = `${BASE_URL}/api/talent/profile?address=${TEST_ADDRESS}`;
    console.log(`   Fetching: ${profileUrl}`);
    
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();
    
    if (profileResponse.ok && profileData.profile) {
      console.log(`✅ Profile API working!`);
      console.log(`   Address: ${TEST_ADDRESS}`);
      console.log(`   Name: ${profileData.profile.name || "N/A"}`);
      console.log(`   Display Name: ${profileData.profile.display_name || "N/A"}`);
      console.log(`   Image URL: ${profileData.profile.image_url ? "✅ Present" : "N/A"}`);
    } else if (profileResponse.ok && Object.keys(profileData).length === 0) {
      console.log(`⚠️  No profile data for this address (this is normal if address doesn't have Talent Protocol profile)`);
    } else {
      console.error(`❌ Profile API error:`, profileData);
    }
  } catch (error) {
    console.error(`❌ Profile API failed:`, error);
  }

  // 4. Test Debug Endpoint
  console.log("\n4️⃣ Testing Debug Endpoint:");
  try {
    const debugUrl = `${BASE_URL}/api/debug`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();
    
    if (debugResponse.ok) {
      console.log(`✅ Debug endpoint accessible`);
      console.log(`   Environment: ${debugData.environment}`);
      console.log(`   Has API Key: ${debugData.hasTalentApiKey ? "✅ Yes" : "❌ No"}`);
      console.log(`   API Key Length: ${debugData.talentApiKeyLength}`);
    } else {
      console.error(`❌ Debug endpoint error:`, debugData);
    }
  } catch (error) {
    console.error(`❌ Debug endpoint failed:`, error);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n✨ Testing complete!");
  console.log(`\n💡 Tip: Try with a different address:`);
  console.log(`   tsx scripts/test-talent-api.ts <address>`);
}

// Run the tests
testTalentAPI().catch(console.error);

