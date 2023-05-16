const socket = require('socket.io')
const server = require('./server')

//running socket.io on server
const io = socket(server , {
    cors:{
      origin:"*"
    }  
}) 

// on fn deals with events
// show visitors on server and recieve events from them
var clients = {}
io.on("connection",(sio)=>{
  console.log("connections")
  console.log(sio.id," has joined")
  /*I say to server if visitor send event(signin)
    then you store this dataEvent(id) to array */  
  sio.on("signin",(id)=>{
    console.log(id)
    clients[id] = sio
    console.log(clients)
  })
  /*I say to server if visitor send event(message)
    then you send this dataEvent(msg) to anthor visitors(has targetId) by emit() */  
  sio.on("message",(msg)=>{
    console.log(msg)
    let targetid = msg.targetid;
    if(clients[targetid]){
      clients[targetid].emit("message",msg)
    } 
    // const username = socket.handshake.query.username
    // const message = {
    //   message: msg.message,
    //   sender: username,
    //   sendAt: Date.now()
    // }
    // messages.push(message)
    // io.emit('message',message)
  })
})