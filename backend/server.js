require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const project = require("./model/projectmodel");
const mongoose = require("mongoose");
const { generateResult } = require('./services/aiServices');

const db = require('./db/db');
const userRoute = require('./routes/userRoutes');
const projectRoute = require('./routes/projectRoutes');
const aiRoute = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const port = process.env.PORT || 5000;

app.use('/api/userapi', userRoute);
app.use('/api/projectapi', projectRoute);
app.use('/api/aiapi', aiRoute);

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Middleware for socket.io authentication
io.use(async (socket, next) => {
    try {
        const projectId = socket.handshake.query.projectId;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error("Invalid projectId"));
        }

        socket.project = await project.findById(projectId);

        let token;
        if (socket.handshake.auth?.token) {
            token = socket.handshake.auth.token;
        } else if (socket.handshake.headers.authorization) {
            const parts = socket.handshake.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }

        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.roomId = socket.project._id.toString();
    socket.join(socket.roomId);

    // Listen for events from the client
    socket.on('project-message', async data => {
        console.log('Received project-message:', data); // Debug log
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');

        if (aiIsPresentInMessage) {
            console.log('AI message detected, processing...'); // Debug log
            // Broadcast user message to all in the room (including sender)
            io.to(socket.roomId).emit('project-message', data);
            
            // Generate AI response
            const prompt = message.replace('@ai', '').trim();
            console.log('AI prompt:', prompt); // Debug log
            const result = await generateResult(prompt);
            console.log('AI result:', result); // Debug log
            
            // Parse the AI response if it's JSON
            let aiMessage;
            try {
                aiMessage = JSON.parse(result);
                console.log('Parsed AI message:', aiMessage); // Debug log
            } catch (e) {
                console.log('Failed to parse AI response as JSON, wrapping in text object'); // Debug log
                // If not JSON, wrap it in a text object
                aiMessage = { text: result };
            }

            // Send AI response to all in the room
            const aiResponse = {
                message: aiMessage,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            };
            console.log('Sending AI response:', aiResponse); // Debug log
            io.to(socket.roomId).emit('project-message', aiResponse);
        } else {
            console.log('Regular message, broadcasting to all'); // Debug log
            // For regular messages, broadcast to all in the room (including sender)
            io.to(socket.roomId).emit('project-message', data);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        socket.leave(socket.roomId);
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`);
});


