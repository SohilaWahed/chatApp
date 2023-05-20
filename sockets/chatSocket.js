module.exports = io => {
    io.on("connection", socket => {
      const connectedUsers = []
      connectedUsers[socket.id] = { username: 'Guest', status: 'online' };
      console.log(connectedUsers)
      
      io.emit('user list update', connectedUsers);
    
      // Listen for a disconnection event from the client
      socket.on('disconnect', () => {
        connectedUsers[socket.id].status = 'offline';
        io.emit('user list update', connectedUsers);
        //console.log(connectedUsers)
        delete connectedUsers[socket.id];
        console.log('User disconnected:', socket.id);
      });
    
      // Join a chat room
      const chatRooms = []
      socket.on('join', (room) => {
        socket.join(room);
        chatRooms[room] = chatRooms[room] || [];
        chatRooms[room].push(socket.id);
        console.log(`User ${socket.id} joined room ${room}`);
      });
      
      // Listen for a message from the client
      socket.on('chat message', (data) => {
        // Send the message to all sockets in the room
        io.to(data.room).emit('chat message', data.message);
        chatRooms[data.room].forEach((id) => {
          if (id !== socket.id) {
            io.to(id).emit('new message', data.message);
          }
        });
      });
      
      // //Leave a chat room
      // socket.on('leave', (room) => {
      //   socket.leave(room);
      //   chatRooms[room] = chatRooms[room].filter((id) => id !== socket.id);
      //   console.log(`User ${socket.id} left room ${room}`);
      // });
    })
}