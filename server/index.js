const { Server } = require("socket.io");

const io = new Server(8080, {
  cors: true,
});

const roomToIdMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("roomJoin", ({ username, room }) => {
    socket.join(room);
    if (roomToIdMap.get(room)) {
      // console.log("socket Id");
      io.to(roomToIdMap.get(room)).emit("remote-user-joined", {
        me: roomToIdMap.get(room),
        id: socket.id,
      });
    } else {
      roomToIdMap.set(room, socket.id);
    }
  });
  socket.on("callUser", (data) => {
    // console.log(data);
    io.to(data.callTo).emit("incoming-call", data);
  });
  socket.on("callAccepted", (data) => {
    // console.log(data.answer);
    io.to(data.callTo).emit("callAccepted", data);
  });
  socket.on("send-stream", (data) => {
    io.to(data.to).emit("send-stream", { from: socket.id });
  });
  socket.on("peer:nego:needed", ({ callTo, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(callTo).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  // socket.on("join-call", ({ id, name }) => {
  //   io.to(id).emit("user-joined", { callFrom: socket.id, name });
  // });
});
