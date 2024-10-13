const peerConnections = {};
const config = {
  iceServers: [
    {
      // "urls": "localhost:4000",
      "urls": "stun:stun.l.google.com:19302",
    },
    // { 
    //   "urls": "turn:TURN_IP?transport=tcp",
    //   "username": "TURN_USERNAME",
    //   "credential": "TURN_CREDENTIALS"
    // }
  ]
};
const CaptureVideo = document.getElementById('broadcast');
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
// let stream;
// const fps = 0;
// if (CaptureVideo.captureStream) {
//   stream = CaptureVideo.captureStream(fps);
// } else if (CaptureVideo.mozCaptureStream) {
//   stream = CaptureVideo.mozCaptureStream(fps);
// } else {
//   console.error('Stream capture is not supported');
//   stream = null;
// }
// console.log(stream);

const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;
  let stream;
  const fps = 0;
  if (CaptureVideo.captureStream) {
    stream = CaptureVideo.captureStream(fps);
  } else if (CaptureVideo.mozCaptureStream) {
    stream = CaptureVideo.mozCaptureStream(fps);
  } else {
    console.error('Stream capture is not supported');
    stream = null;
  }
  // let stream = videoElement.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));


  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
});
socket.emit("test", "test");

window.onunload = window.onbeforeunload = () => {
  socket.close();
};
socket.emit("broadcaster");
