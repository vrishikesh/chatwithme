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
 * Video chat
 */
function getLVideo(callbacks) {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
  const constraints = {
    audio: true,
    video: true,
  };
  navigator.getUserMedia(constraints, callbacks.success, callbacks.error);
}

function recStream(stream, elemid) {
  const video = geid(elemid);

  video.srcObject = stream;

  window.peer_stream = stream;
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

peer.on("open", () => {
  geid("displayId").innerHTML = peer.id;
});

peer.on("connection", (connection) => {
  conn = connection;
  peer_id = connection.peer;

  geid("connId").value = peer_id;
});

peer.on("error", (err) => {
  alert("error:" + err);
  console.log(err);
});

geid("conn_button").addEventListener("click", () => {
  peer_id = geid("connId").value;

  if (peer_id) {
    conn = peer.connect(peer_id);
  } else {
    alert("enter an id");
    return false;
  }
});

peer.on("call", (call) => {
  const acceptCall = confirm("Do you want to accept this call?");

  if (acceptCall) {
    call.answer(window.localstream);

    call.on("stream", (stream) => {
      window.peer_stream = stream;

      recStream(stream, "rVideo");
    });

    call.on("close", () => {
      alert("The call has ended");
    });
  } else {
    console.log("call denied");
  }
});

geid("call_button").addEventListener("click", () => {
  console.log("calling a peer: " + peer_id);
  console.log(peer);

  const call = peer.call(peer_id, window.localstream);

  call.on("stream", (stream) => {
    window.peer_stream = stream;

    recStream(stream, "rVideo");
  });
});
