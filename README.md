
---

# 🗨️ Realtime Chat Application (WebSockets)

A full-featured **real-time, room-based chat application** built using **WebSockets**, focusing on correct real-time behavior, network resilience, and clean client–server architecture — without using Redis or a database.

This project demonstrates how modern chat systems work internally: online presence, typing indicators, reconnection handling, and in-memory state management.

---

## ✨ Key Highlights

* Designed for **real-world network conditions**
* Clean WebSocket message contracts
* Robust reconnect handling
* In-memory backend state (intentionally no DB / Redis)
* Focus on correctness over shortcuts

---

## 🚀 Features

### 💬 Real-Time Messaging

* Instant message delivery using WebSockets
* Room-based chat (messages isolated per room)
* System messages for user join/leave events

---

### 🟢 Online Users List (Per Room)

* Live list of users currently connected to a room
* Updates automatically when users:

  * join
  * leave
  * refresh
  * disconnect unexpectedly
* Implemented using server-side in-memory state

---

### ✍️ Typing Indicator

* Shows when a user is typing in the room
* Broadcast-only (not stored or persisted)
* Server attaches username for correctness
* Auto-clears after inactivity
* Cooldown-based sending to prevent spam

---

### 🔄 Auto-Reconnect & Network Awareness

* Detects connection loss
* Handles browser offline/online events
* Reconnects automatically when network is restored
* Prevents reconnect spam while offline
* Safely cleans up stale sockets and timers

---

### 🕒 Message Timestamps

* Server attaches timestamps to each message
* Frontend formats timestamps for display
* Ensures consistent time data across clients

---

### 🧠 In-Memory State Management

* Server maintains active connections in memory
* No database or Redis used by design
* State resets cleanly on server restart
* Suitable for learning, demos, MVPs, and interviews

---

### 🎨 Polished UI

* Dark theme using soft black & off-white colors
* Subtle animations for messages and input
* Clean, readable layout optimized for chat UX

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **TypeScript**
* **WebSocket API**
* **GSAP** (UI animations)
* Modern state & effect management with hooks

### Backend

* **Node.js**
* **WebSocket (`ws`)**
* In-memory data structures (`Array`, `Set`)
* Event-driven architecture

---

## 📡 WebSocket Message Protocol

### Join Room

```json
{
  "type": "join",
  "payload": {
    "roomId": "room1",
    "username": "dev"
  }
}
```

---

### Chat Message

```json
{
  "type": "chat",
  "payload": {
    "message": "Hello everyone!",
    "sender": "dev",
    "timestamp": 1710000000000
  }
}
```

---

### Typing Indicator

```json
{
  "type": "typing",
  "payload": {
    "username": "dev"
  }
}
```

---

### Online Users List

```json
{
  "type": "users",
  "payload": ["dev", "alex", "sara"]
}
```

---

## 🧠 Architecture Overview

### Server-Side

* Maintains active connections in memory
* Tracks:

  * socket
  * roomId
  * username
* Derives:

  * online users list
  * typing events
* Broadcasts events only to relevant room members

### Client-Side

* Single WebSocket connection per room
* React state reflects server events
* UI updates are fully event-driven
* Timers and listeners are cleaned up on unmount

---

## ⚠️ Design Decisions & Trade-offs

### Why No Database / Redis?

* Online presence and typing are **ephemeral**
* Persistence is unnecessary for core functionality
* Keeps the system simple and fast
* Makes behavior easier to reason about

### What Happens on Server Restart?

* All in-memory state resets
* Clients reconnect automatically
* Rooms and user lists rebuild dynamically

This behavior is **intentional and expected**.

---

## 📂 Project Structure (Simplified)

```
/server
  └── index.js        # WebSocket server logic

/client
  ├── Chat.tsx        # Chat UI & WebSocket handling
  ├── hooks/          # Custom hooks (optional refactor)
  └── styles/         # UI styles & theme
```

---

## 🔒 Limitations (Current Scope)

* No authentication
* No message persistence
* Single-server only
* Usernames not enforced as unique

These are deliberate to keep the focus on **real-time fundamentals**.

---

## 🔮 Possible Improvements

* Username uniqueness handling
* Heartbeat (ping/pong) for dead connection detection
* Message persistence with a database
* Redis-based presence for multi-server scaling
* Authentication & authorization
* Mobile responsiveness improvements

---

## 📄 License

MIT License

---

## 🧠 Summary

This project demonstrates a **correct and thoughtful implementation of real-time chat**, emphasizing:

* clean WebSocket contracts
* proper lifecycle handling
* resilience to network instability
* clarity over complexity

Ideal for learning, interviews, and showcasing real-time system design.

---


