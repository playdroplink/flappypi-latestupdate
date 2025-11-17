# Flappy Pi API Routes

## 1. POST /save-score

**Description:** Save the player’s latest game score
**Request Body:**

```json
{
  "piUserId": "string",
  "score": number,
  "sessionId": "string"
}
```

**Response:**

* 200 OK with confirmation
* 400 Bad Request on invalid data
* 500 Server Error on failure

---

## 2. GET /leaderboard

**Description:** Retrieve top 10 player scores
**Query Parameters:**

* Optional: `limit` (default 10)
  **Response:**

```json
[
  {
    "piUserId": "string",
    "username": "string",
    "score": number,
    "rank": number
  },
  ...
]
```

---

## 3. POST /purchase

**Description:** Record an in-game purchase
**Request Body:**

```json
{
  "piUserId": "string",
  "itemId": "string",
  "amountPi": number,
  "transactionId": "string"
}
```

**Response:**

* 200 OK with updated user inventory
* 400 Bad Request on invalid data
* 402 Payment Required if payment fails

---

## 4. POST /reward-ad

**Description:** Award user for watching rewarded ad
**Request Body:**

```json
{
  "piUserId": "string",
  "adId": "string",
  "timestamp": "ISO8601 string"
}
```

**Response:**

* 200 OK with reward details
* 429 Too Many Requests if cooldown active

---

## 5. POST /distribute-rewards

**Description:** (Protected) Distribute weekly Pi rewards to top players
**Request Body:** None
**Response:**

* 200 OK on success
* 403 Forbidden if unauthorized

---

## 6. GET /user-inventory

**Description:** Fetch user’s purchased items and skins
**Query Parameters:**

* `piUserId` (required)
  **Response:**

```json
{
  "piUserId": "string",
  "items": [
    {
      "itemId": "string",
      "quantity": number,
      "purchasedAt": "ISO8601 string"
    }
  ]
}
```


