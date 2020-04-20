const socket = io();

const geid = (id) => document.getElementById(id);

const message = geid("message"),
  handle = geid("handle"),
  output = geid("output"),
  form = geid("form-signin"),
  typing = geid("typing");

/**
 * Send message to clients
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  socket.emit("userMessage", {
    handle: handle.value,
    message: message.value,
  });

  message.value = "";
});

/**
 * Send typing message
 */
message.addEventListener("keypress", (e) => {
  socket.emit("userTyping", handle.value);
});

/**
 * Listen for message from the server
 */
socket.on("userMessage", (data) => {
  typing.innerHTML = "";
  output.innerHTML += `<p><strong>${data.handle}: </strong>${data.message}</p>`;
});

socket.on("userTyping", (data) => {
  typing.innerHTML = `<p><em>${data} is typing...</em></p>`;
});

/**
 * Start the local video camera
 */
function getLVideo(callbacks) {
  /**
   * Check for getUserMedia for cross browser support
   */
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  /**
   * Add constraints for audio and video playback
   */
  const constraints = {
    audio: true,
    video: true,
  };
  navigator.getUserMedia(constraints, callbacks.success, callbacks.error);
}

/**
 * Start receiving the video stream
 */
function recStream(stream, elemid) {
  const video = geid(elemid);

  /**
   * Older browsers may not have srcObject
   */
  if ("srcObject" in video) {
    video.srcObject = stream;
  } else {
    /**
     * This is only for old browsers this will be removed
     */
    video.src = window.URL.createObjectURL(stream);
  }

  window.peer_stream = stream;
}

function onOpen() {
  geid("displayId").innerHTML = peer.id;
}

function onConnection(connection) {
  conn = connection;
  peer_id = connection.peer;

  geid("connId").value = peer_id;
}

function onError(err) {
  alert("error:" + err);
  console.log(err);
}

function handleConnectButton() {
  peer_id = geid("connId").value;

  if (peer_id) {
    conn = peer.connect(peer_id);
  } else {
    alert("enter an id");
    return false;
  }
}

function onCall(call) {
  const acceptCall = confirm("Do you want to accept this call?");

  if (acceptCall) {
    call.answer(window.localstream);

    call.on("stream", onCallStart);

    call.on("close", onCallEnd);
  } else {
    alert("call denied");
    console.log("call denied");
  }
}

function onCallStart(stream) {
  window.peer_stream = stream;

  recStream(stream, "rVideo");
}

function onCallEnd() {
  alert("The call has ended");
}

function handleCallButton() {
  console.log("calling a peer: " + peer_id);
  console.log(peer);
  if (!peer_id) {
    peer_id = geid("connId").value;
  }

  if (peer_id) {
    const call = peer.call(peer_id, window.localstream);

    call.on("stream", onCallStart);

    call.on("close", onCallEnd);
  } else {
    alert("enter an id");
    return false;
  }
}

getLVideo({
  success: (stream) => {
    window.localstream = stream;
    recStream(stream, "lVideo");
  },
  error: (err) => {
    alert("Cannot access camera");
    console.log(err);
  },
});

let conn, peer_id;

const peer = new Peer({ key: "lwjd5qra8257b9" });

/**
 * Establishing connection to peer server
 */
peer.on("open", onOpen);

/**
 * Receive a connection request
 */
peer.on("connection", onConnection);

/**
 * If anything fails
 */
peer.on("error", onError);

/**
 * Establish a connection to the entered peer id
 */
geid("conn_button").addEventListener("click", handleConnectButton);

/**
 * On receiving call request
 */
peer.on("call", onCall);

/**
 * Start call request
 */
geid("call_button").addEventListener("click", startPeerCall);
