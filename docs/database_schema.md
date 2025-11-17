# Flappy Pi Database Schema

## Overview

The database stores user data, scores, purchases, and rewards. It supports efficient leaderboard queries and secure transaction tracking.

---

## Collections / Tables

### 1. Users

| Field     | Type      | Description               | Index   |
| --------- | --------- | ------------------------- | ------- |
| piUserId  | String    | Unique Pi Network user ID | Primary |
| username  | String    | Display name              | Indexed |
| piBalance | Number    | Current Pi coin balance   |         |
| createdAt | Timestamp | Account creation date     |         |
| lastLogin | Timestamp | Last login timestamp      |         |

---

### 2. Scores

| Field      | Type      | Description             | Index   |
| ---------- | --------- | ----------------------- | ------- |
| scoreId    | String    | Unique score entry ID   | Primary |
| piUserId   | String    | User ID                 | Indexed |
| score      | Number    | Score value             | Indexed |
| sessionId  | String    | Game session ID         |         |
| achievedAt | Timestamp | When score was achieved | Indexed |

---

### 3. Purchases

| Field         | Type      | Description                   | Index   |
| ------------- | --------- | ----------------------------- | ------- |
| purchaseId    | String    | Unique purchase ID            | Primary |
| piUserId      | String    | User ID                       | Indexed |
| itemId        | String    | Purchased item identifier     |         |
| amountPi      | Number    | Pi coins spent                |         |
| transactionId | String    | Payment transaction reference | Indexed |
| purchasedAt   | Timestamp | Purchase date/time            | Indexed |

---

### 4. Rewards

| Field      | Type      | Description              | Index   |
| ---------- | --------- | ------------------------ | ------- |
| rewardId   | String    | Unique reward entry ID   | Primary |
| piUserId   | String    | User ID                  | Indexed |
| amountPi   | Number    | Reward amount            |         |
| rewardType | String    | e.g., weekly leaderboard |         |
| awardedAt  | Timestamp | Reward grant date/time   | Indexed |

---

## Indexes & Optimization

* Index scores by piUserId and score descending for fast leaderboard queries
* Index purchases by transactionId to avoid duplicates
* Index rewards by piUserId and awardedAt for reward tracking

---

## Notes

* Use UTC timestamps throughout
* Enforce data validation on all inputs
* Store minimal sensitive data, rely on Pi Network for auth

---

