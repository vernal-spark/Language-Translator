import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import { SocketProvider } from "./context/SocketProvide";
import { SnackbarProvider } from "notistack";
import RoomPage from "./Pages/RoomPage/RoomPage";

function App() {
  return (
    <SnackbarProvider>
      <SocketProvider>
        <div className="App">
          <Routes>
            <Route path="/room/:id" Component={RoomPage} />
            <Route path="/" Component={HomePage} />
          </Routes>
        </div>
      </SocketProvider>
    </SnackbarProvider>
  );
}

export default App;
