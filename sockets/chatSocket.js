module.exports = io => {
    io.on("connection", socket => {

          socket.on("join chat", (chatId) => {
            socket.join(chatId);
            console.log("User Joined Room: " + chatId);
          });
        
          socket.on("typing", (room) => socket.in(room).emit("typing"));
          
          socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
        
          socket.on("new message", (newMessageRecieved) => {
            
            //socket.to(chat.id).emit("message recieved", newMessageRecieved);
            
            var chat = newMessageRecieved.chat;
        
            if (!chat.users) return console.log("chat.users not defined");
        
           chat.users.forEach((user) => {

              if (user._id == newMessageRecieved.sender._id) return;
              
              socket.in(user._id).emit("message recieved", newMessageRecieved); // server send message to reciever
            });
        
          });
    })
}