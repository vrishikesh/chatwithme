const socket = io();

const message = document.getElementById("message"),
  handle = document.getElementById("handle"),
  output = document.getElementById("output"),
  form = document.getElementById("form-signin"),
  typing = document.getElementById("typing");

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
