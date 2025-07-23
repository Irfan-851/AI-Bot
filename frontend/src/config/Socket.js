import { io } from "socket.io-client";

// Use correct backend port
const SOCKET_URL = "http://localhost:5000";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  console.log("Initializing socket with projectId:", projectId); // Debug log
  // Disconnect previous socket if it exists
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  socketInstance = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });
  
  // Add connection event listeners
  socketInstance.on('connect', () => {
    console.log('Socket connected:', socketInstance.id);
  });
  
  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socketInstance;
};

export const received = (eventName, callback) => {
  if (!socketInstance) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  console.log("Setting up listener for event:", eventName); // Debug log
  socketInstance.on(eventName, callback);
  // Optionally return a function to remove the listener
  return () => socketInstance.off(eventName, callback);
};

export const send = (eventName, data) => {
  if (!socketInstance) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  console.log("Sending event:", eventName, "with data:", data); // Debug log
  socketInstance.emit(eventName, data);
};
