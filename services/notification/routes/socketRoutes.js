const { send } = require("../controllers/assigneeController")


module.exports = (io) => {

    // Listen for socket connections
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);


        socket.on("join_personal_room", () => {
            console.log(`${socket.id} joined ${socket.user.id}`)
            socket.join(socket.user.id);
        });

        socket.on("send_notification", (data) => {
            send(socket, data);
        })


        socket.on("disconnect_personal_room", () => {
            console.log(`${socket.id} Disconnected`)
        });
    });

};
