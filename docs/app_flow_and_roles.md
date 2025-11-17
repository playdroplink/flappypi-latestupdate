# Flappy Pi App Flow and Roles

## 1. User Flow

### 1.1 Launch & Splash Screen

* User opens the app
* Splash screen displays logo, app title, and branding for \~2.5 seconds
* Automatic transition to Login Screen

### 1.2 Authentication

* User logs in via Pi Network SDK
* Successful login redirects to Main Menu
* Option to logout or switch account available

### 1.3 Main Menu

* Options displayed:

  * Start Game
  * Shop
  * Leaderboard
  * Settings
* Displays user Pi balance and profile info

### 1.4 Gameplay

* User taps/clicks to control bird
* Pipes scroll with increasing difficulty
* Score increments per pipe passed
* Collision triggers Game Over screen

### 1.5 Game Over Screen

* Displays current score and best score
* Options:

  * Retry (with or without revive)
  * Return to Main Menu

### 1.6 Shop

* Display bird skins, revives, and score multipliers
* Show Pi coin prices and purchase buttons
* Handle purchase confirmation and update inventory/balance

### 1.7 Leaderboard

* Display top 10 players with usernames and scores
* Real-time updates after each game session

### 1.8 Settings

* Toggle music and sound effects
* Logout button

---

## 2. Component Roles

| Component          | Responsibility                                     |
| ------------------ | -------------------------------------------------- |
| Splash Screen      | Branding display and initial loading               |
| Auth Module        | Handle Pi Network login/logout                     |
| Game Engine        | Core gameplay logic, controls, collision detection |
| UI Manager         | Menus, buttons, dialogs, feedback                  |
| Shop Module        | Display items, handle purchases, update balance    |
| Leaderboard Module | Fetch and display scores, update live data         |
| Ads Module         | Rewarded ad logic and UI                           |
| Backend API        | Save scores, fetch leaderboard, handle rewards     |
| Payment Module     | Pi coin transactions and wallet integration        |

---

