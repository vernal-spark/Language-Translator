import React, { useState, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../../context/SocketProvide";
import peer from "../../utils/peer";
// import ReactAudioPlayer from "react-audio-player";
import "./RoomPage.css";

const RoomPage = () => {
  // const [me, setMe] = useState(null);
  // const [myName, setMyname] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteId, setRemoteId] = useState(null);
  // const [isSpeaking, setIsSpeaking] = useState(false);
  const socket = useSocket();

  // const handleMedia = useCallback(async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true,
  //   });
  //   setLocalStream(stream);
  // }, []);

  const handleCallUser = useCallback(
    async (data) => {
      setRemoteId(data.id);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("1", stream);
      setLocalStream(stream);
      const offer = await peer.getOffer();
      socket.emit("callUser", { callFrom: data.me, callTo: data.id, offer });
    },
    [socket]
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("1", stream);
      setLocalStream(stream);
      setRemoteId(data.callFrom);
      const answer = await peer.getAnswer(data.offer);
      socket.emit("callAccepted", {
        callFrom: data.callTo,
        callTo: data.callFrom,
        answer,
      });
    },
    [socket]
  );

  useEffect(() => {
    console.log(localStream);
  }, [localStream]);

  const handleCallAccepted = useCallback(
    async (data) => {
      await peer.setLocalDescription(data.answer);
      console.log("2", localStream);
      for (const track of localStream.getTracks()) {
        peer.peer.addTrack(track, localStream);
      }
      socket.emit("send-stream", { to: data.callFrom });
    },
    [localStream, socket]
  );

  const handleSendStream = useCallback(
    async (data) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      for (const track of stream.getTracks()) {
        peer.peer.addTrack(track, localStream);
      }
    },
    [localStream]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, callTo: remoteId });
  }, [remoteId, socket]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    // handleMedia();
    socket.on("remote-user-joined", handleCallUser);
    socket.on("incoming-call", handleIncommingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("send-stream", handleSendStream);
    return () => {
      socket.off("remote-user-joined", handleCallUser);
      socket.off("incoming-call", handleIncommingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("send-stream", handleSendStream);
    };
  }, [
    handleCallAccepted,
    handleCallUser,
    handleIncommingCall,
    handleNegoNeedFinal,
    handleNegoNeedIncomming,
    socket,
    localStream,
    handleSendStream,
  ]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      // console.log(ev);
      const remoteStream = ev.streams;
      // console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
    return () => {
      peer.peer.removeEventListener("track", async (ev) => {
        const remoteStream = ev.streams;
        // console.log("GOT TRACKS!!");
        setRemoteStream(remoteStream[0]);
      });
    };
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // const nameChar = myName ? myName[0].toUpperCase() : "";
  // const borderClass = isSpeaking ? "speaking" : "";

  return (
    <>
      <div className="room-container">
        <h1 className="title">LingoLink</h1>
        <div className="media-container">
          <div className="media-element">
            {/* <div className={`name-char ${borderClass}`}>{nameChar}</div> */}
            <ReactPlayer
              url={localStream}
              playing
              muted
              width="800px"
              height="600px"
            />
          </div>
          <div className="media-element">
            {/* <div className={`name-char ${borderClass}`}>{nameChar}</div> */}
            {remoteStream && (
              <ReactPlayer
                url={remoteStream}
                playing
                width="800px"
                height="600px"
              />
            )}
          </div>
        </div>
        <div>
          {/* <p className="text">Copy and Paste "{me}" to join a call</p> */}
        </div>
      </div>
    </>
  );
};

export default RoomPage;

// const audioContext = new AudioContext();
// const analyser = audioContext.createAnalyser();
// const source = audioContext.createMediaStreamSource(stream);
// source.connect(analyser);
// analyser.fftSize = 256;
// const bufferLength = analyser.frequencyBinCount;
// const dataArray = new Uint8Array(bufferLength);

// analyser.getByteTimeDomainData(dataArray);

// const checkSpeaking = () => {
//   analyser.getByteTimeDomainData(dataArray);
//   const rms = Math.sqrt(
//     dataArray.reduce((acc, val) => acc + val * val, 0) / bufferLength
//   );
//   setIsSpeaking(rms > 228); // You can adjust this threshold as needed
//   requestAnimationFrame(checkSpeaking);
// };
// setTimeout(() => {
//   checkSpeaking();
// }, 10000);
