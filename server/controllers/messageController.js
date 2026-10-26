import { prisma } from '../config/prisma.js';

// Format message for client compatibility
const formatMessage = (msg) => {
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

export const getCaseMessages = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const healthCase = await prisma.healthCase.findUnique({
      where: { id: caseId }
    });
    if (!healthCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { caseId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: messages.map(formatMessage)
    });
  } catch (error) {
    next(error);
  }
};

export const markCaseMessagesRead = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    await prisma.chatMessage.updateMany({
      where: {
        caseId,
        senderId: { not: req.user.id },
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};
