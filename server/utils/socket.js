// config/socket.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);
        
        // Join user to their personal room
        socket.join(`user_${socket.userId}`);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });

        // Handle joining specific rooms if needed
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
        });

        // Handle leaving rooms
        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
        });

        // Handle custom notification events
        socket.on('markNotificationRead', (notificationId) => {
            // This could trigger additional logic if needed
            console.log(`User ${socket.userId} marked notification ${notificationId} as read`);
        });
    });

    return io;
};

const getSocketIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getSocketIO
};