# Registry of Verified Onchain Builders

## Overview

- A decentralized registry that identifies and recognizes genuine onchain builders through verified attestations.
- The registry will launch on May 1st, 2025 (Builders Day) with a Times Square billboard featuring verified builders' names.

## Key Concepts

- **Verified Builder**: Anyone with proven contributions to a working blockchain project (including hackathon projects)
- **Verification Partner**: Trusted protocols and organizations that can verify builders
- **Attestations**: Onchain verifications using Ethereum Attestation Service (EAS) on Base network
- **Public Good**: An open resource anyone can use to find, recognize, and reward real builders

## Why It Matters

- Makes it easier to discover legitimate blockchain builders
- Transforms "builder" from a self-claimed title to a meaningful credential
- Creates an interoperable primitive that works across communities and chains
- Increases visibility for active builders who might not promote themselves

## How It Works

1. **Trusted Verification**: Only attestations from approved Verification Partners count
2. **Onchain Proof**: All verifications are issued as public, verifiable attestations
3. **No Expiration**: Attestations don't expire but can be revoked if needed
4. **Multiple Verifications**: Builders can be verified by multiple partners (positive signal)
5. **Read-Only App**: The registry app reads attestation data from EAS; all attestations are created directly through EAS UI

## Attestation Details

### Schema A: Verification Partner Attestation

```tsx
{
  name: string,         // partner name (e.g., "Talent Protocol")
  url: string           // partner URL
}
```

- Issued by **attestations.talentprotocol.eth** to the **partner's wallet address**
- Used to validate who has authority to issue verified builder attestations
- Revocable = true
- [Verification Partner Live Schema on Base URL](https://base.easscan.org/schema/view/0x0c25f92df9ba914668f7780e428a1b5238ae7441c765fbe8b7b528f8209ef4e3)

### Schema B: Verified Builder Attestation

```tsx
{
  isBuilder: boolean
  context: string,       // e.g. "Built the frontend for XYZ protocol"
}
```

- Issued by verification partner to **builder address** (recipient)
- No expiration time
- References "Verification Partner" attestation (UID)
- Revocable = true
- [Verified Builder Attestation Live Schema on Base URL](https://base.easscan.org/schema/view/0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5)

## Registry App Implementation

### Tech Stack

- React, TypeScript, NextJS
- Shadcn, Tailwind CSS, Lucide icons
- Supabase for database
- Vercel for deployment
- EAS SDK for reading attestations from Base network

### Features

- Builders Directory: Searchable, filterable list of verified builders
- Partners Directory: List of verification partners with verification counts
- Partner Application: Button linking to a Notion form for organizations to apply as verification partners
- Builder Search: Simple search functionality by wallet address or other identifiers
- Partner Filter: Filter builders by verification partners

### Development Iterations

#### 1. Design Mode (Frontend Prototype)

- Build UI with mock data
- Show aggregated metrics: Verified Builders, Verification Partners, Total Attestations
- Builder table with (in this order): Address, Verifications, First Verified, Verified By, Context
- Search bar to search for builder wallet address or ENS
- CTA for builders to create Talent Protocol profiles
- CTA for for organizations to apply to become new verification partners through a Notion form

#### 2. EAS Integration

- A read-only application that displays builder attestations from EAS on the Base network, with simple search and filter by verification partner functionality
- Read attestation data directly from [Ethereum Attestation Service (EAS)](https://docs.attest.org) on Base network
- Set up sync between EAS and Supabase
- Fetch attestations via EAS GraphQL Subgraph (Base)
  - show only attestations where isBuilder = True
- Parse and display:
  - Builder wallet address or ENS
  - Context of verification
  - Verifier (attester address)
  - Date of verification
  - Direct link to attestation on [EASScan](https://base.easscan.org) on Base
    - “Verified By” should link to the corresponding Verification Partner attestation.
    - “First Verified” and “Context” should both link to the corresponding Builder attestation.
- The app does not to write attestations directly (these will be done through the EAS UI)

#### 3. Partners Page

- Partners leaderboard showing attestation counts
- Visual highlight for partners with 50+ attestations
- Step-by-step guide for partners to verify builders on EAS
  - partners need to issue attestations directly on the EAS UI: https://base.easscan.org/attestation/attestWithSchema/0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5
  - dropdown to select partner → show partner attestation UID and a shortcut to copy the UID
  - remind user to open "Advanced Options" and add the Referenced Attestation UID on the EAS UI
  - remind user to make sure the toggle for isBuilder is True and the the final toggle is "Onchain", not "Offchain" (the default will be False and Offchain, so this is important)
- The app does not include any authentication or partner dashboards.

#### 4. Backend Implementation

- Supabase setup to cache and serve attestation data
- Database schema for partners and builders
- The app does not include any authentication or admin dashboards.

#### 5. Talent API Integration

- Enrich builder records with Talent Protocol data
- Add fields: Display Name, Builder Score, Main Role, Location
- Add average builder score to Partners Leaderboard
- [Talent Protocol API](https://docs.talentprotocol.com/docs/developers/talent-api/api-reference-v2/talent-profiles)

#### 6. Performance Optimization

- React Query for client-side caching
- HTTP Caching with Vercel

## Database Schema

```sql
-- Create partners table
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  recipient_address TEXT NOT NULL UNIQUE,  -- Partner's wallet address
  attester_address TEXT NOT NULL,          -- attestations.talentprotocol.eth address
  attestation_uid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  verified_builders_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create builders table
CREATE TABLE builders (
  id SERIAL PRIMARY KEY,
  recipient_address TEXT NOT NULL,         -- Builder's wallet address
  attester_address TEXT NOT NULL,          -- Partner's wallet address who verified this builder
  attestation_uid TEXT NOT NULL UNIQUE,
  ref_uid TEXT REFERENCES partners(attestation_uid),
  is_builder BOOLEAN NOT NULL,
  context TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipient_address, attester_address)
);

-- Create index for efficient queries
CREATE INDEX idx_builders_attester_address ON builders(attester_address);
CREATE INDEX idx_builders_recipient_address ON builders(recipient_address);
```

## Connection to Builders Day

- Launching on May 1st, 2025 (Builders Day)
- Builders verified before April 17th will be featured on Times Square
- Partners who verify 50+ builders will have their logo displayed on the Times Square ad
- Creating an annual tradition of recognizing blockchain builders
