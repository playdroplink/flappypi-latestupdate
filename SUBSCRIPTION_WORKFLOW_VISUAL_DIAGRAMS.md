# Subscription Modal Workflow - Visual Diagrams

## Complete User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLAPPY PI SUBSCRIPTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              START: Game Screen
                                      ↓
                            User Clicks "Subscribe"
                                      ↓
                    ┌───────────────────────────────────┐
                    │  SubscriptionPlansModal Opens    │
                    │  ┌─────────────────────────────┐ │
                    │  │ Plan: Starter (5 Pi, 7d)   │ │
                    │  │ Features: ...               │ │
                    │  │ Rewards Preview: ...        │ │
                    │  │ [Pay with Pi] [Mock Pi]    │ │
                    │  └─────────────────────────────┘ │
                    │  ┌─────────────────────────────┐ │
                    │  │ Plan: Premium (15 Pi, 15d) │ │
                    │  │ Features: ...               │ │
                    │  │ Rewards Preview: ...        │ │
                    │  │ [Pay with Pi] [Mock Pi]    │ │
                    │  └─────────────────────────────┘ │
                    │  ┌─────────────────────────────┐ │
                    │  │ Plan: Ultimate (30 Pi, 30d)│ │
                    │  │ Features: ...               │ │
                    │  │ Rewards Preview: ...        │ │
                    │  │ [Pay with Pi] [Mock Pi]    │ │
                    │  └─────────────────────────────┘ │
                    └───────────────────────────────────┘
                                      ↓
                        User Selects Plan & Clicks Payment
                    (Mock for testing, Real for production)
                                      ↓
                        ┌──────────────────────────────┐
                        │ Payment Processing...        │
                        │ ┌────────────────────────┐  │
                        │ │ Real Pi: A2U Flow      │  │
                        │ │ 3-step (create, submit,│  │
                        │ │ complete)              │  │
                        │ └────────────────────────┘  │
                        │ ┌────────────────────────┐  │
                        │ │ Mock: Instant Process  │  │
                        │ │ via inventoryService   │  │
                        │ └────────────────────────┘  │
                        └──────────────────────────────┘
                                      ↓
                        ┌──────────────────────────────┐
                        │ Toast: "Subscription        │
                        │ Activated! 🎉"              │
                        └──────────────────────────────┘
                                      ↓
        ┌───────────────────────────────────────────────────────┐
        │         EnhancedRewardModal Opens                     │
        │         (showRewardModal = true)                      │
        │                                                       │
        │  ┌──────────────────────────────────────────────┐   │
        │  │         🎁 SUBSCRIPTION REWARDS!            │   │
        │  │                                              │   │
        │  │  Reward Cards (animated):                  │   │
        │  │  ┌──────────┐  ┌──────────┐ ┌──────────┐  │   │
        │  │  │ 💰 Coins │  │ 🛡️ Shield │ │🐦Phoenix │  │   │
        │  │  │          │  │ Powerup  │ │ Skin     │  │   │
        │  │  │   150    │  │    x3    │ │(Ultimate)│  │   │
        │  │  └──────────┘  └──────────┘ └──────────┘  │   │
        │  │  ┌──────────┐  ┌──────────┐              │   │
        │  │  │⚡ Speed  │  │🧲 Magnet │              │   │
        │  │  │ Boost    │  │ Powerup  │              │   │
        │  │  │   x1     │  │   x2     │              │   │
        │  │  └──────────┘  └──────────┘              │   │
        │  │                                           │   │
        │  │  claimed = false                         │   │
        │  │  ┌──────────────────┐  ┌─────────────┐ │   │
        │  │  │🎉 Claim All     │  │💼 Save for │ │   │
        │  │  │    Rewards       │  │  Later     │ │   │
        │  │  └──────────────────┘  └─────────────┘ │   │
        │  └──────────────────────────────────────────┘   │
        └───────────────────────────────────────────────────────┘
                                      ↓
                    User Chooses Action on Rewards
                                      ↓
                        ┌─────────────────────┐
                        │  Two Paths Here:    │
                        └─────────────────────┘
                                      ↓
                ┌─────────────────────────────────────────────┐
                │ PATH A: "💼 Save for Later"                │
                │         (Unclaimed Rewards)                │
                └─────────────────────────────────────────────┘
                            vs
                ┌─────────────────────────────────────────────┐
                │ PATH B: "🎉 Claim All Rewards"            │
                │         (Immediate Inventory)              │
                └─────────────────────────────────────────────┘
                                      ↓
                        ┌──────────────────────────────┐
                        │ Toast: "Rewards Claimed!     │
                        │ 🎉" (3 second duration)      │
                        │                              │
                        │ claimed = true               │
                        │ (Buttons change)             │
                        └──────────────────────────────┘
                                      ↓
        ┌───────────────────────────────────────────────────────┐
        │     Reward Modal: Post-Claim State                   │
        │                                                       │
        │  ┌──────────────────────────────────────────────┐   │
        │  │    🎉 REWARDS CLAIMED!                      │   │
        │  │                                              │   │
        │  │  All items now in your inventory:           │   │
        │  │  • 150 coins ✓                              │   │
        │  │  • Shield Powerup x3 ✓ (equipped: true)    │   │
        │  │  • Speed Boost x1 ✓ (equipped: true)       │   │
        │  │  • Phoenix Skin ✓ (equipped: true)         │   │
        │  │                                              │   │
        │  │  claimed = true                             │   │
        │  │  ┌──────────────────┐  ┌──────────────┐    │   │
        │  │  │✅ Close          │  │📦 View      │    │   │
        │  │  │                  │  │   Inventory │    │   │
        │  │  └──────────────────┘  └──────────────┘    │   │
        │  └──────────────────────────────────────────────┘   │
        └───────────────────────────────────────────────────────┘
                                      ↓
                            User Clicks "✅ Close"
                                      ↓
                T+1500ms: onClose() callback triggers
                          setShowRewardModal(false)
                          Reward modal fade-out begins
                                      ↓
                    ~300ms fade transition period
                          (smooth visual transition)
                                      ↓
                T+1800ms: Cascade Close Triggers
                          ┌───────────────────────────┐
                          │ setPaymentPlan(null)      │
                          │ setRewards([])            │
                          │ Parent onClose()          │
                          │                           │
                          │ Subscription Modal        │
                          │ fade-out begins           │
                          └───────────────────────────┘
                                      ↓
                T+2000ms: Both Modals Closed
                          All State Reset
                                      ↓
                    ┌──────────────────────────────┐
                    │   Original Screen Returns   │
                    │   (Inventory/Profile/Home)  │
                    │                              │
                    │ ✓ Fire Phoenix visible &     │
                    │   equipped                   │
                    │ ✓ Powerups in inventory      │
                    │ ✓ Coins added to wallet      │
                    │ ✓ Seasons unlocked           │
                    └──────────────────────────────┘
                                      ↓
                              END: Game Continues
```

## State Machine Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION MODAL STATE MACHINE                  │
└──────────────────────────────────────────────────────────────────────┘

    Initial State
    ┌─────────────────┐
    │ showRewardModal:│
    │ false           │
    │ claimed: false  │
    │ rewards: []     │
    └─────────────────┘
            │
            │ User clicks "Subscribe"
            ↓
    ┌─────────────────┐
    │ SubscriptionModal│
    │ opens           │
    │ (modal visible) │
    └─────────────────┘
            │
            │ User clicks payment button
            ↓
    ┌─────────────────────────┐
    │ isProcessingPayment: true│
    │ (loading state)         │
    └─────────────────────────┘
            │
            │ Payment succeeds
            ↓
    ┌──────────────────────────────┐
    │ showRewardModal: true        │
    │ rewards: [...items...]       │
    │ claimed: false               │
    │ (reward cards display)       │
    └──────────────────────────────┘
            │
            ├─────────────────────────────────┐
            │                                 │
            │ User clicks claim              │ User clicks save
            ↓                                 ↓
    ┌────────────────────┐        ┌──────────────────────────┐
    │ claimed: true      │        │ unclaimed rewards saved  │
    │ buttons change     │        │ modal closes immediately │
    │ (display success)  │        │ onClose() → setShowReward│
    │ T+1000-1500ms      │        │Modal(false)              │
    └────────────────────┘        └──────────────────────────┘
            │                                 │
            │                                 │
            │ T+1500ms: onClose()             │
            │ Timeout expires                 │ (same: onClose)
            ↓                                 ↓
    ┌─────────────────────────────────────────────────────┐
    │ setShowRewardModal(false)                           │
    │ Reward modal fade-out begins                        │
    │ ─ Wait 300ms for cascade close ─                   │
    └─────────────────────────────────────────────────────┘
            │
            │ T+1800ms: setPaymentPlan(null)
            │          setRewards([])
            │          Parent onClose()
            ↓
    ┌─────────────────────────────────────────────────────┐
    │ Subscription modal fade-out begins                  │
    └─────────────────────────────────────────────────────┘
            │
            │ T+2000ms+: Both modals closed
            ↓
    ┌──────────────────────────────────────────────────────┐
    │ showRewardModal: false                               │
    │ claimed: false (reset)                               │
    │ rewards: [] (cleared)                                │
    │ paymentPlan: null (cleared)                          │
    │                                                      │
    │ Previous screen displayed                           │
    │ (Inventory/Profile/HomePage)                        │
    └──────────────────────────────────────────────────────┘
            │
            │ User can see new items in inventory
            │ User can see Fire Phoenix equipped
            │ User can see unlocked seasons
            ↓
        Ready for next action
```

## Button State Transitions

```
┌──────────────────────────────────────────────────────────────────┐
│                    BUTTON STATE MANAGEMENT                       │
└──────────────────────────────────────────────────────────────────┘

                        Reward Modal Opens
                        claimed = false
                                │
                                ↓
                    ┌─────────────────────────────┐
                    │  Unclaimed Rewards State    │
                    │  ┌───────────────────────┐ │
                    │  │ 🎉 Claim All Rewards  │ │
                    │  │ (Purple - Primary)    │ │
                    │  └───────────────────────┘ │
                    │  ┌───────────────────────┐ │
                    │  │ 💼 Save for Later     │ │
                    │  │ (Gray - Secondary)    │ │
                    │  └───────────────────────┘ │
                    └─────────────────────────────┘
                                │
                    User clicks "Claim All"
                                │
                                ↓
                    Processing (1000-1500ms)
                    └─ Claim logic runs
                    └─ Fire Phoenix auto-equipped
                    └─ Powerups auto-equipped
                    └─ Coins added
                    └─ Seasons unlocked
                                │
                                ↓
                    ┌─────────────────────────────┐
                    │  Claimed Rewards State      │
                    │  ┌───────────────────────┐ │
                    │  │ ✅ Close              │ │
                    │  │ (Green - Primary)     │ │
                    │  └───────────────────────┘ │
                    │  ┌───────────────────────┐ │
                    │  │ 📦 View Inventory     │ │
                    │  │ (Blue - Secondary)    │ │
                    │  └───────────────────────┘ │
                    └─────────────────────────────┘
                                │
                    User can click either button
                    Both trigger onClose()
                                │
                                ↓
                    Modal Cascade Close Sequence
                    (See state machine above)
```

## Timing Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         SUBSCRIPTION FLOW TIMELINE                           │
└──────────────────────────────────────────────────────────────────────────────┘

Time →

0ms     ├─ User clicks "Subscribe"
        │
50ms    ├─ Subscription Modal Opens ────────────────────────────────┐
        │                                                            │
100ms   ├─ User clicks payment button                               │
        │  (or "🧪 Mock Pi Payment")                                │
        │                                                            │
200ms   ├─ Payment Processing Begins ─────────────────┐            │
        │                                              │             │
300ms   ├─ Payment Completes                          │             │
        │  └─ Toast: "Subscription Activated! 🎉"    │             │
        │                                              │             │
350ms   ├─ EnhancedRewardModal Opens (fade-in)       │             │
        │  └─ showRewardModal = true                 │             │
        │  └─ claimed = false                         │             │
        │  └─ Display reward cards                    │             │
        │  └─ Buttons: "Claim" | "Save"              │             │
        │                                              │             │
400ms   ├─ User can see rewards                       │             │
        │                                              │             │
500ms   ├─ User clicks "🎉 Claim All Rewards"        │             │
        │                                              │             │
550ms   ├─ Claiming Process Starts                    │             │
        │  ├─ inventoryService.claimSubscriptionRewards()        │
        │  ├─ Fire Phoenix → equipped: true           │             │
        │  ├─ Powerups → equipped: true               │             │
        │  └─ Coins added to wallet                   │             │
        │                                              │             │
600ms   ├─ Claiming Completes                        │             │
        │  └─ claimed = true                         │             │
        │  └─ Toast: "Rewards Claimed! 🎉"           │             │
        │  └─ Buttons change: "Close" | "Inventory" │             │
        │                                              │             │
1000ms  ├─ User reviews claimed state                │             │
        │  └─ Can confirm items received             │             │
        │                                              │             │
1500ms  ├─ TIMEOUT TRIGGER                           │             │
        │  └─ onClose() from EnhancedRewardModal    │             │
        │  └─ setShowRewardModal(false)              │             │
        │  └─ Reward modal fade-out begins           │             │
        │  └─ Duration: ~200ms (CSS animation)       │             │
        │                                              │             │
1500-   ├─ SMOOTH TRANSITION WINDOW (~300ms)         │             │
1800ms  │  └─ Visual fade between modals             │             │
        │  └─ No jarring switches                    │             │
        │                                              │             │
1800ms  ├─ CASCADE CLOSE TRIGGER                     │             │
        │  ├─ setPaymentPlan(null)                   │             │
        │  ├─ setRewards([])                         │             │
        │  ├─ Parent onClose()                       │             │
        │  └─ Subscription modal fade-out begins     │             │
        │                                              │             │
2000ms  ├─ BOTH MODALS CLOSED                        │             │
        │  └─ showRewardModal: false     ◄────────────┼─────────────┘
        │  └─ paymentPlan: null           ◄───────────┘
        │  └─ rewards: []
        │  └─ Previous screen displays
        │
2050ms  ├─ User sees game screen again
        │  ├─ Fire Phoenix visible in profile
        │  ├─ Fire Phoenix active as bird
        │  ├─ Powerups visible in inventory
        │  ├─ New coins in wallet
        │  └─ New seasons unlocked
        │
2100ms+ └─ User can continue playing

Total Duration: ~2 seconds (very fast!)
```

## Fire Phoenix Auto-Equip Flow

```
┌────────────────────────────────────────────────────────────────────┐
│            FIRE PHOENIX AUTO-EQUIP SYSTEM                          │
└────────────────────────────────────────────────────────────────────┘

User Claims Ultimate Plan Rewards
                │
                ↓
    ┌─────────────────────────────────────┐
    │ Reward Item: Fire Phoenix           │
    │ ├─ id: 'inferno-phoenix' (shop)    │
    │ ├─ name: 'Fire Phoenix'            │
    │ ├─ type: 'skin'                    │
    │ ├─ image: '/birds2/bird_12.gif'   │
    │ └─ rarity: 'Legendary'             │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 1] EnhancedRewardModal       │
    │ Lines ~165-180                     │
    │                                     │
    │ Auto-equip check:                  │
    │ if (type === 'skin' &&             │
    │     (id === 'inferno_phoenix' OR   │
    │      id === 'inferno-phoenix'))    │
    │   equipped: true ✓                 │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 2] inventoryService         │
    │ claimSubscriptionRewards()          │
    │ Lines ~2488-2496                    │
    │                                     │
    │ Normalize ID to 'inferno_phoenix'  │
    │ Set equipped: true ✓               │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 3] inventoryService         │
    │ saveToInventory()                   │
    │ Lines ~396-404                      │
    │                                     │
    │ Save to localStorage with:         │
    │ - ID: 'inferno_phoenix'            │
    │ - equipped: true                   │
    │ - image: '/birds2/bird_12.gif'    │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 4] ProfilePage              │
    │ Initial Load Hook                   │
    │ Lines ~276-290                      │
    │                                     │
    │ Normalize ID when loading skins    │
    │ Both formats recognized ✓          │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 5] ProfilePage              │
    │ Inventory Update Listener          │
    │ Lines ~372-384                      │
    │                                     │
    │ Listen for inventory changes       │
    │ Normalize Fire Phoenix ID ✓        │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 6] ProfilePage              │
    │ handleSkinSelect()                 │
    │ Lines ~493-532                      │
    │                                     │
    │ Normalize before saving to profile │
    │ equipItem() with normalized ID ✓   │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 7] ProfilePage              │
    │ Render Current Bird Display        │
    │ Lines ~1041-1055                    │
    │                                     │
    │ Normalize ID for image lookup      │
    │ Display Fire Phoenix with GIF ✓    │
    └─────────────────────────────────────┘
                │
                ↓
    ┌─────────────────────────────────────┐
    │ [POINT 8] GameMode Component       │
    │                                     │
    │ Automatically uses equipped bird   │
    │ Fire Phoenix appears in game ✓     │
    └─────────────────────────────────────┘
                │
                ↓
    Fire Phoenix visible and active
    throughout entire application ✓✓✓
```

## Complete Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│              SUBSCRIPTION SYSTEM INTEGRATION MAP                    │
└─────────────────────────────────────────────────────────────────────┘

              SubscriptionPlansModal
                     │
         ┌───────────┼───────────┐
         │           │           │
         ↓           ↓           ↓
    Real Payment  Mock Payment  Reward Preview
         │           │           │
         │       ┌───┴───┬───────┴───┐
         │       │       │           │
         ↓       ↓       ↓           ↓
    directPayment    inventoryService    EnhancedRewardModal
    Service          processMockPayment      │
         │                 │               (display rewards)
         │             ┌───┴───┐           │
         │             │       │           │
         ↓             ↓       ↓           ↓
    Pi Network    Coin Rewards  Subscription    claimSubscription
    API             Added         Item Created   Rewards()
         │             │           │
         │         ┌───┴───────────┴───┐
         │         │                   │
         ↓         ↓                   ↓
    PaymentDB  Wallet Updated  inventoryService
    (Supabase)      │          saveToInventory()
         │          │                │
         ├──────────┼────────────────┼──────────────┐
         │          │                │              │
         │          │                │              ↓
         │          │                │         localStorage
         │          │                │         (inventory items)
         │          │                │              │
         │          │       ┌────────┴──────────────┼────────┐
         │          │       │                       │        │
         │          │       ↓                       ↓        ↓
         │          │     ProfilePage         GameMode   HomePage
         │          │       │                       │        │
         │          │    (skin select)        (bird choice) (display)
         │          │       │                       │        │
         │          └───────┼───────────────────────┼────────┘
         │                  │                       │
         │              equipItem()            Uses equipped bird
         │                  │                       │
         │                  ↓                       ↓
         │           Skin Normalization      Fire Phoenix
         │           ID: 'inferno_phoenix'   appears in game
         │           equipped: true           ✓
         │                  │
         └──────────────────┼─────────────────────────────────
                            │
                            ↓
                     Final State: User sees
                     ✓ Fire Phoenix in profile
                     ✓ Fire Phoenix in game
                     ✓ Powerups equipped
                     ✓ Coins in wallet
                     ✓ Seasons unlocked
```

These visual diagrams show:
1. Complete user journey from subscription to game return
2. State transitions at each step
3. Button changes based on claimed state
4. Precise timing of each operation
5. Fire Phoenix auto-equip at 8 critical points
6. How all components integrate together

The workflow is **organized, smooth, and well-coordinated** across all components.
