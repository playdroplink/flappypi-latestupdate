# 🐤 Flappy Pi – Build Plan

**Project:** Flappy Pi  
**Platform:** Pi Network Game App  
**Stack:** React / Next.js + Supabase + Vercel + TailwindCSS + Phaser.js  
**Payment:** Pi Wallet & Pi Auth  
**Monetization:** Pi Ad Network + In-App Purchases

---

## ✅ Step 1: Splash to Pi Browser Detection & Pi Auth Workflow

### Tasks:
- [ ] Create a **Splash Screen** with loading animation.
- [ ] Detect **Pi Browser** via `window.Pi`. Redirect to instruction page if not found.
- [ ] Integrate `window.Pi.authenticate()` for user login.
  - Capture: `username`, `accessToken`, `wallet_address`.
- [ ] Display a **Welcome Page** after login.
- [ ] Set up routing: `Splash > Auth > Confirm > Home`.

---

## ✅ Step 2: App Features (Play, Home, Shop, Leaderboard)

### Pages:
- **Home**
  - [ ] Display username, Pi balance.
  - [ ] Buttons: [Play], [Shop], [Leaderboard], [Settings].

- **Play**
  - [ ] Implement Flappy Bird-style gameplay using Phaser.js or Canvas.
  - [ ] Track high scores.

- **Shop**
  - [ ] Sell character skins, power-ups, themes.
  - [ ] Items purchasable with Pi.
  - [ ] Items saved to Supabase.

- **Leaderboard**
  - [ ] Fetch and display global top scores.

- **Settings**
  - [ ] Sound toggle, reset progress, logout button.

---

## ✅ Step 3: Pi Ad Network & Pi Wallet Integration

### Tasks:
- [ ] Integrate **Pi Ad Network** SDK for rewarded ads (if available).
- [ ] Use `Pi.createPayment()` for Pi-based purchases.
- [ ] Store transaction logs in Supabase.
- [ ] Display real-time payment confirmation.

---

## ✅ Step 4: Domain, Vercel & Supabase Setup

### Hosting:
- [ ] Buy & connect custom domain (e.g. `flappypi.fun`) to Vercel.
- [ ] Deploy React/Next.js app on **Vercel**.
- [ ] Add environment variables for secure API use.

### Database (Supabase):
- [ ] `users`: `id`, `username`, `wallet`, `items`
- [ ] `scores`: `user_id`, `score`, `date`
- [ ] `transactions`: `user_id`, `amount`, `item`, `status`

---

## ✅ Step 5: Final Testing & Mobile Optimization

### Tasks:
- [ ] Make the UI fully responsive (TailwindCSS).
- [ ] Test across devices (Pi Browser, mobile browsers).
- [ ] Handle errors gracefully: auth issues, failed payments, 404s.
- [ ] Smooth animations, fast load times.

---

## ✅ Step 6: Payment System & Subscription

### Tasks:
- [ ] Test all **shop item purchases** for success/failure cases.
- [ ] Show equipped items in real time.
- [ ] Optional: Add a **Pi Subscription** model.
  - Premium monthly bird or theme access.
- [ ] Display owned inventory from Supabase.

---

## ✅ Step 7: Pi Mainnet Launch

### Final Tasks:
- [ ] Replace testnet settings with **Mainnet** endpoints.
- [ ] Remove dev logs, flags, and test-only conditions.
- [ ] Announce launch in Pi chats, social media.
- [ ] Add analytics & basic bug reporting or feedback form.

---

## 🔧 Optional Future Add-ons

- [ ] Multiplayer Flappy Battle mode.
- [ ] Weekly tournaments (top scorers get Pi rewards).
- [ ] NFT skins (minted via Pi smart contracts).
- [ ] Live events (Christmas skin, Pi Day bonus).
- [ ] Discord bot to track leaderboards.

---

## ⚙️ Tech Stack Summary

| Feature          | Tool/Stack               |
|------------------|--------------------------|
| UI               | React / Next.js, TailwindCSS |
| Game Engine      | Phaser.js (Flappy Bird Clone) |
| Auth & Payment   | Pi Network SDK (Pi Auth + Pi Wallet) |
| DB & API         | Supabase                 |
| Hosting          | Vercel + Custom Domain   |
| Ads              | Pi Ad Network SDK        |

---


