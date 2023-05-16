module.exports = io => {
    io.on("connection", socket => {
        socket.on("joinNotificationsRoom", userId => {
            socket.join(userId);
        });
        socket.on("goOnline", userId => {
            io.onlineUsers[userId] = true;
            socket.on("disconnect", () => {
                io.onlineUsers[userId] = false;
            });
        });
    });
};