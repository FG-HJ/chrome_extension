const io = new Server(res.socket.server,{ path: '/api/socket',addTrailingSlash: false });
res.socket.server.io = io;
let peerConnection;
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
  ]
};

const socket = io.connect(window.location.origin);
const watch = document.getElementById('watch');
const enableAudioButton = document.querySelector("#enable-audio");
var gameresult =document.getElementsByClassName("result")[0];
// enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    watch.srcObject = event.streams[0];
    watch.autoplay=true;
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});
socket.on("showimage", (message)=>{
  gameresult.innerHTML=message;
})
window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};
watch.muted = true;
