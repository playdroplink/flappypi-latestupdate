# Flappy Pi Component Tree

## 1. App Root

* Manages overall app state, routing between screens, and global services (Pi SDK, backend API)

## 2. SplashScreen

* Displays branded logo, title, and subtitle on app launch
* Handles timeout and transition to LoginScreen

## 3. LoginScreen

* Pi Network authentication UI
* Login button and status feedback

## 4. MainMenu

* Navigation hub with buttons: Start Game, Shop, Leaderboard, Settings
* Shows user profile info and Pi balance

## 5. GameScreen

* Core gameplay canvas (Phaser.js or similar)
* Displays game UI elements: score, lives, pause button

## 6. GameOverScreen

* Shows final score and best score
* Buttons: Retry (with or without revive), Main Menu

## 7. ShopScreen

* Displays purchasable items (bird skins, revives, multipliers)
* Shows Pi prices and purchase buttons
* Handles purchase confirmations and errors

## 8. LeaderboardScreen

* Lists top 10 players with username, rank, and score
* Auto-refreshes after games or periodically

## 9. SettingsScreen

* Toggles for music, sound effects
* Logout button

## 10. AdsManager (Overlay Component)

* Handles rewarded ad display and cooldown timers
* Triggers rewards on ad completion

## 11. PiSDKWrapper (Service Module)

* Manages Pi Network login/logout
* Handles payments and wallet connection

## 12. ApiService (Service Module)

* Centralizes backend API calls: save score, fetch leaderboard, record purchases, distribute rewards

---

