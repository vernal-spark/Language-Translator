import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(" https://1b7a-2401-4900-1f26-67d9-51-9e71-c332-459c.ngrok-free.app"), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
