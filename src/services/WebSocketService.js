import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
  }

  connect(userId, userType = 'client') {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Connect to Socket.IO server (adjust URL as needed)
    this.socket = io('http://localhost:3000', {
      query: { userId, userType },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      this.connectionCallbacks.forEach(callback => callback(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
    });

    this.socket.on('new_message', (data) => {
      console.log('New message received:', data);
      this.messageCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendMessage(recipientId, message, senderType) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        recipientId,
        message,
        senderType
      });
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  removeMessageCallback(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  removeConnectionCallback(callback) {
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
  }
}

export default new WebSocketService();