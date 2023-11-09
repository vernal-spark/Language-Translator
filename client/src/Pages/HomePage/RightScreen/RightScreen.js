import React, { useState } from "react";
import { useSocket } from "../../../context/SocketProvide";
// import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import "./RightScreen.css";

const RightScreen = () => {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();

  const handleRoomJoin = () => {
    socket.emit("roomJoin", { room, username });
    navigate(`/room/${room}`);
  };

  return (
    <div className="sub-container-2">
      <>
        <h2 className="heading">Join Room</h2>
        <input
          placeholder="Enter Room"
          className="input"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input
          placeholder="Enter Your Name"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="btn join-btn" onClick={handleRoomJoin}>
          Join
        </button>
      </>
      {/* )} */}
    </div>
  );
};

export default RightScreen;
