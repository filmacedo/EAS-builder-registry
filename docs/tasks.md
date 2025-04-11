# EAS Builder Registry - Task Manager

## Completed Tasks ✅

### Design Mode (Frontend Prototype)

- [x] Set up Next.js project with TypeScript
- [x] Implement UI with Shadcn and Tailwind CSS
- [x] Create mock data for builders and partners
- [x] Build aggregated metrics display
- [x] Implement builder table with required columns
- [x] Add search functionality for builder wallet/ENS
- [x] Add CTAs for Talent Protocol profiles and partner applications

### EAS Integration

- [x] Set up EAS SDK integration
- [x] Configure connection to Base network
- [x] Implement attestation data fetching
- [x] Create attestation display components
- [x] Add links to EASScan for attestations
- [x] Implement verification partner reference system

### Partners Page

- [x] Create partners leaderboard
- [x] Implement attestation count display
- [x] Add visual highlight for 50+ attestation partners
- [x] Create step-by-step guide for partner verification
- [x] Add partner attestation UID copy functionality

## Pending Tasks 📝

### Performance Optimization & Caching

- [ ] Implement basic time-based caching using Next.js unstable_cache:
  - [ ] Set up 5-minute cache for EAS attestations using unstable_cache
  - [ ] Add cache for Talent API responses using unstable_cache
  - [ ] Configure Vercel edge caching
- [ ] Add basic performance monitoring
- [ ] Implement error handling for cache misses

### OnchainKit Integration

- [ ] Set up OnchainKit Identity component
- [ ] Implement builder avatar display
- [ ] Add fallback images for missing avatars
- [ ] Test avatar loading performance

### Talent API Integration

- [ ] Set up Talent API connection:
  - [x] Create .env.local file with TALENT_API_KEY
  - [x] Add environment variable validation in src/lib/env.ts
  - [x] Document API key setup in README
- [ ] Add caching for Talent API responses
- [ ] Implement Builder Score fetching
- [ ] Add Talent profile links
- [ ] Add average builder score to Partners Leaderboard

## Future Enhancements 🔮

- [ ] Add builder profile pages
- [ ] Implement advanced search filters
- [ ] Add social sharing functionality
- [ ] Create API documentation
- [ ] Add analytics tracking
- [ ] Implement dark mode
- [ ] Add mobile responsiveness improvements

## Notes

- All tasks should be completed before May 1st, 2025 (Builders Day)
- Builders verified before April 17th will be featured on Times Square
- Partners with 50+ verifications will have their logos displayed on Times Square ad
