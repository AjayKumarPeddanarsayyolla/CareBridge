import { Server } from 'socket.io';
import { verifyToken } from '../config/jwt.js';
import { prisma } from '../config/prisma.js';

let ioInstance = null;

const formatChatMessage = (msg) => {
  if (!msg) return null;
  return {
    ...msg,
    _id: msg.id,
    read: msg.isRead,
    senderId: msg.sender
      ? {
          ...msg.sender,
          _id: msg.sender.id
        }
      : msg.senderId
  };
};

export const initSocketIO = (httpServer, clientUrl) => {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    // Join private user room for personal notifications
    socket.join(`user_${user.id}`);

    // Join case room for real-time discussion
    socket.on('join_case', async ({ caseId }) => {
      try {
        const healthCase = await prisma.healthCase.findUnique({
          where: { id: caseId }
        });
        if (!healthCase) {
          return socket.emit('error_message', { message: 'Case not found' });
        }

        // Room name
        const roomName = `case_${caseId}`;
        socket.join(roomName);
        io.to(roomName).emit('user_joined_room', {
          userId: user.id,
          fullName: user.fullName,
          role: user.role
        });
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    socket.on('leave_case', ({ caseId }) => {
      socket.leave(`case_${caseId}`);
    });

    // Handle incoming chat messages
    socket.on('send_message', async ({ caseId, content, attachments = [] }) => {
      try {
        if (!content || !content.trim()) return;

        const healthCase = await prisma.healthCase.findUnique({
          where: { id: caseId }
        });
        if (!healthCase) return;

        const recipientId =
          user.role === 'DOCTOR'
            ? healthCase.patientId
            : healthCase.assignedDoctorId || null;

        const message = await prisma.chatMessage.create({
          data: {
            caseId,
            senderId: user.id,
            senderRole: user.role,
            recipientId,
            content: content.trim(),
            attachments: attachments && attachments.length > 0 ? attachments : undefined
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                role: true,
                profilePhoto: true
              }
            }
          }
        });

        const formattedMessage = formatChatMessage(message);

        // Broadcast to case room
        io.to(`case_${caseId}`).emit('receive_message', formattedMessage);

        // Notify recipient if assigned and not in the active room
        if (recipientId) {
          io.to(`user_${recipientId}`).emit('new_message_notification', {
            caseId,
            senderName: user.fullName,
            snippet: content.substring(0, 80)
          });
        }
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ caseId }) => {
      socket.to(`case_${caseId}`).emit('user_typing', {
        userId: user.id,
        fullName: user.fullName
      });
    });

    socket.on('stop_typing', ({ caseId }) => {
      socket.to(`case_${caseId}`).emit('user_stop_typing', {
        userId: user.id
      });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToUser = (userId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(eventName, payload);
  }
};

export const emitToCase = (caseId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`case_${caseId}`).emit(eventName, payload);
  }
};
