# Socket.IO Server Setup for Real-Time Chat

## Backend Setup (Laravel + Socket.IO)

### 1. Install Socket.IO Server
```bash
npm install socket.io
```

### 2. Create Socket Server (server.js)
```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app URL
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { userId, userType } = data;
    connectedUsers.set(userId, { socketId: socket.id, userType });
    socket.userId = userId;
    socket.userType = userType;
    console.log(`User ${userId} (${userType}) authenticated`);
  });

  // Handle sending messages
  socket.on('send_message', (data) => {
    const { recipientId, message, senderType } = data;

    // Save message to database (you'll need to implement this)
    // saveMessageToDatabase(socket.userId, recipientId, message, senderType);

    // Send to recipient if online
    const recipient = connectedUsers.get(recipientId);
    if (recipient) {
      io.to(recipient.socketId).emit('new_message', {
        sender_id: socket.userId,
        sender_type: senderType,
        message: message,
        timestamp: new Date()
      });
    }

    // Also emit back to sender for confirmation
    socket.emit('message_sent', { success: true });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running on port 3000');
});
```

### 3. Laravel Broadcasting Setup
Add to your `config/broadcasting.php`:
```php
'connections' => [
    // ... existing connections

    'socketio' => [
        'driver' => 'socketio',
        'host' => env('SOCKET_IO_HOST', '127.0.0.1'),
        'port' => env('SOCKET_IO_PORT', 3000),
    ],
],
```

### 4. Environment Variables
Add to `.env`:
```
BROADCAST_DRIVER=socketio
SOCKET_IO_HOST=127.0.0.1
SOCKET_IO_PORT=3000
```

### 5. Start the Socket.IO Server
```bash
node server.js
```

## Frontend Notes

The frontend is now configured to:
- Connect to WebSocket server on component mount
- Show "🟢 Live" when connected, "🟡 Polling" when using HTTP fallback
- Send messages via WebSocket when connected
- Receive real-time messages instantly
- Fall back to HTTP polling when WebSocket is unavailable

## Testing

1. Start your Laravel backend
2. Start the Socket.IO server: `node server.js`
3. Start your React frontend
4. Open two browser tabs (one as doctor, one as client)
5. Messages should appear instantly when WebSocket is connected