const Comment = require('../models/Comment');
const multer = require('multer');
const uploadToS3 = require('../utils/s3Upload');

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const MAX_FILES = 5;

exports.handleFileUpload = async (socket, files) => {
    try {
        const userId = socket.user.id;
          // Validate number of files
        if (files.length > MAX_FILES) {
            throw new Error(`Maximum ${MAX_FILES} files allowed`);
        }

        // Validate file sizes
        for (const file of files) {
            let bufferLength;
            if (typeof file.buffer === 'string') {
                // Base64 string - calculate actual size (base64 is ~33% larger)
                bufferLength = Math.floor((file.buffer.length * 3) / 4);
            } else if (Array.isArray(file.buffer)) {
                bufferLength = file.buffer.length;
            } else {
                bufferLength = file.buffer?.length || file.buffer?.byteLength || 0;
            }
            if (bufferLength > MAX_FILE_SIZE) {
                throw new Error(`File ${file.originalname} exceeds 5MB limit`);
            }
        }
        // Ensure files are in the correct format
        const processedFiles = files.map(file => {
            let buffer;
            // Handle different buffer formats from frontend
            if (Buffer.isBuffer(file.buffer)) {
                buffer = file.buffer;
            } else if (typeof file.buffer === 'string') {
                // Base64 string from browser
                buffer = Buffer.from(file.buffer, 'base64');
            } else if (Array.isArray(file.buffer)) {
                // Convert array to Buffer (from browser)
                buffer = Buffer.from(file.buffer);
            } else if (file.buffer instanceof Uint8Array) {
                buffer = Buffer.from(file.buffer);
            } else if (file.buffer && typeof file.buffer === 'object' && file.buffer.data) {
                // Handle ArrayBuffer-like objects
                buffer = Buffer.from(file.buffer.data || file.buffer);
            } else {
                buffer = Buffer.from(file.buffer);
            }
            
            return {
                buffer,
                originalname: file.originalname,
                mimetype: file.mimetype
            };
        });

        const uploadPromises = processedFiles.map(file => uploadToS3(file, userId));
        const uploadedFiles = await Promise.all(uploadPromises);
        
        return uploadedFiles;
    } catch (error) {
        console.error('File upload error:', error);
        socket.emit('upload_error', { message: 'Failed to upload file' });
        return null;
    }
}

exports.clearTaskComments = async (socket, data) => {
    try {
        const { taskId } = data;
        const userId = socket.user.id;

        // Instead of deleting, update all comments for this task to be hidden for this user
        await Comment.updateMany(
            { taskId: taskId.toString() },
            { $addToSet: { hiddenFor: userId } }
        );

        // Only emit to the user who cleared the chat
        socket.emit('chat_cleared');
        
        return { success: true, message: 'Chat history cleared successfully' };
    } catch (error) {
        console.error('Clear chat error:', error.message);
        socket.emit('comment_error', { message: 'Failed to clear chat history' });
        return { success: false, message: error.message };
    }
};

exports.togglePinMessage = async (socket, data) => {
    try {
      const { commentId, taskId } = data;
      const userId = socket.user.id;
  
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
  
      // Toggle pin status
      comment.isPinned = !comment.isPinned;
      comment.pinnedBy = comment.isPinned ? userId : null;
      comment.pinnedAt = comment.isPinned ? new Date() : null;
      await comment.save();
  
      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'name avatar')
        .populate('pinnedBy', 'name');
  
      const pinnedComment = {
        id: populatedComment._id.toString(),
        name: populatedComment.author.name,
        authorId: populatedComment.author._id.toString(),
        avatar: populatedComment.author.avatar,
        content: populatedComment.content,
        attachments: populatedComment.attachments,
        timestamp: populatedComment.createdAt,
        isPinned: populatedComment.isPinned,
        pinnedBy: populatedComment.pinnedBy?.name,
        pinnedAt: populatedComment.pinnedAt
      };
  
      // Emit to all users in the task room
      socket.nsp.to(taskId).emit('message_pin_updated', pinnedComment);
  
    } catch (error) {
      console.error('Pin message error:', error.message);
      socket.emit('comment_error', { message: 'Failed to pin message' });
    }
  };
exports.getTaskComments = async (socket, data) => {
    try {
        const { taskId } = data;
        const userId = socket.user.id;
        
        const comments = await Comment.find({
            taskId: taskId.toString(),
            hiddenFor: { $ne: userId }
        })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 });
            
        // Format comments consistently
        const formattedComments = comments.map(comment => ({
            id: comment._id.toString(),
            name: comment.author.name || 'Unknown',
            authorId: comment.author._id.toString(),
            avatar: comment.author.avatar || '',
            content: comment.content,
            attachments: comment.attachments || [],
            timestamp: comment.createdAt,
            isPinned: comment.isPinned,
            pinnedBy: comment.pinnedBy?.name,
            pinnedAt: comment.pinnedAt
        }));

        // Send comments with currentUserId
        socket.emit('task_comments', {
            comments: formattedComments,
            currentUserId: userId
        });
    } catch (error) {
        console.error('Get comments error:', error.message);
        socket.emit('comment_error', { message: 'Failed to load comments' });
    }
};

exports.handleComment = async (socket, data) => {
    try {
        const { taskId, content, attachments = [], files } = data;
        const senderId = socket.user.id;
        
        // Handle any new file uploads
        let uploadedFiles = [];
        if (files && files.length > 0) {
            uploadedFiles = await handleFileUpload(socket, files);
            if (!uploadedFiles) {
                throw new Error('File upload failed');
            }
        }

        const comment = new Comment({
            taskId: taskId.toString(),
            author: senderId,
            content,
            attachments: [...attachments, ...uploadedFiles],
            hiddenFor: []
        });
        await comment.save();
    
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name avatar');

        if (!populatedComment) {
            throw new Error('Failed to create comment');
        }
            
        
        const commentData = {
            id: populatedComment._id.toString(),
            name: populatedComment.author.name || 'Unknown',
            taskId: populatedComment.taskId,
            authorId: populatedComment.author._id.toString(),
            avatar: populatedComment.author.avatar || '',
            content: populatedComment.content,
            attachments: populatedComment.attachments || [],
            timestamp: populatedComment.createdAt
        };

       
        socket.nsp.to(taskId).emit('receive_comment', commentData);

    } catch (error) {
        console.error('Comment error:', error.message);
        socket.emit('comment_error', { message: 'Failed to send message' });
    }
};