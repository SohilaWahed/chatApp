const dotenv = require('dotenv');
const mongoose = require('mongoose');


//console.log(undefine var)
process.on('uncaughtException',err =>{
  console.log('UNCAUGHT EXCEPTION , Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

const app = require('./app.js');

//read all vars in config file as environment vars
dotenv.config({path:'./config.env'}); 

const DB = process.env.DATABASE.replace(
    '<password>',process.env.PASSWORD
)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(con => console.log('DB connection successful'))

const port =  process.env.PORT || 3000 ;

const server = app.listen(port, () => {
  console.log(`App running in ${port}...`)
});

//fail connect with db 
process.on('unhandledRejection',err=>{
  console.log(err.name, err.message)
  console.log('UNHANDLER REJECTION , Shutting down...')
  //close server and app
  server.close(()=>{
    // 0: success , 1: uncaught exception
    process.exit(1)
  })
})

/* ****************SocketIO***************** */

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

require("./sockets/chatSocket")(io);

// io.on("connection",(socket)=>{

//   console.log("Connected to socket.io");

  // socket.on("setup", (userData) => {
  //   socket.join(userData._id);
  //   socket.emit("connected");
  // });

  // // room is chatId
  // socket.on("join chat", (room) => {
  //   socket.join(room);
  //   console.log("User Joined Room: " + room);
  // });

  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // socket.on("new message", (newMessageRecieved) => {
  //   var chat = newMessageRecieved.chat;

  //   if (!chat.users) return console.log("chat.users not defined");

  //  chat.users.forEach((user) => {

  //     if (user._id == newMessageRecieved.sender._id) return;
      
  //     socket.in(user._id).emit("message recieved", newMessageRecieved); // server send message to reciever
    
  //   });

  // });

  // socket.off("setup", () => {
  //   console.log("USER DISCONNECTED");
  //   socket.leave(userData._id);
  // });
  
//})
