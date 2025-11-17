# Flappy Pi Deployment Guide

## Overview

This guide walks you through deploying the Flappy Pi app frontend and backend to production, ensuring it runs smoothly on Pi App Platform and standard web hosts.

---

## Prerequisites

* Node.js and npm installed
* Firebase CLI or access to your chosen cloud hosting (e.g., Vercel, Heroku)
* Pi Network Developer credentials (App ID, API keys)
* Git repository with the Flappy Pi source code

---

## Frontend Deployment

### 1. Build and Prepare

* Ensure all frontend files (`index.html`, `styles.css`, `game.js`, etc.) are finalized
* Optimize assets (images, sounds) for web delivery
* Confirm `manifest.json` and `` are in place for PWA support

### 2. Deploy to Firebase Hosting (Example)

* Initialize Firebase in your project directory (if not already done):

  ```bash
  firebase init hosting
  ```
* Select the public directory (e.g., `public/` or root where `index.html` lives)
* Set rewrite rules to support SPA routing (if applicable)
* Deploy using:

  ```bash
  firebase deploy --only hosting
  ```

### 3. Deploy to Vercel (Alternative)

* Install Vercel CLI:

  ```bash
  npm i -g vercel
  ```
* Run deployment command in your project root:

  ```bash
  vercel
  ```
* Follow prompts to link or create a new project and deploy

---

## Backend Deployment

### 1. Choose Backend Platform

* Options: Firebase Functions, Heroku, Vercel Serverless Functions, or your own Node.js server
* Ensure environment variables (e.g., database URLs, Pi API keys) are securely set

### 2. Setup Database

* Configure MongoDB Atlas, Firestore, or Realtime Database according to your choice
* Apply necessary rules and indexes for performance and security

### 3. Deploy Backend Code

* For Firebase Functions:

  ```bash
  firebase init functions
  firebase deploy --only functions
  ```
* For Heroku:

  ```bash
  heroku create
  git push heroku main
  heroku config:set VAR_NAME=value
  ```
* For Vercel Serverless:
  Deploy functions folder alongside frontend via Vercel CLI

---

## Environment Variables

Ensure the following are configured in your deployment environment:

* `PI_APP_ID` — Your Pi Network app identifier
* `DATABASE_URL` — Your database connection string
* `PI_WALLET_ADDRESS` — Recipient wallet for in-app purchases
* Any API keys or secrets used for backend verification

---

## Continuous Integration / Continuous Deployment (CI/CD)

* Set up GitHub Actions, GitLab CI, or similar pipelines to automate testing and deployment on commits
* Include linting, unit tests, and build steps before deployment

---

## Testing & Monitoring

* Verify login, payment, gameplay, and leaderboard features post-deployment
* Monitor backend logs for errors or unusual activity
* Use performance tools to optimize loading times and responsiveness

---

## Troubleshooting

* Common Issues:

  * CORS errors — Ensure backend API allows requests from your frontend domain
  * Authentication failures — Double-check Pi SDK integration and redirect URIs
  * Payment errors — Validate wallet addresses and Pi network connectivity

---

## References

* [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
* [Vercel Deployment Docs](https://vercel.com/docs)
* [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
* [Pi Network Developer Portal](https://minepi.com/developers)

---
