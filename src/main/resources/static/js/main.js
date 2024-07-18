document.addEventListener("DOMContentLoaded", function () {
  const usernameForm = document.getElementById("usernameForm");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("message");
  const messageArea = document.getElementById("messageArea");
  const connectingElement = document.querySelector(".connecting");
  let stompClient;
  let username;

  const showMessage = (message) => {
    const li = document.createElement("li");
    li.textContent = message;
    messageArea.appendChild(li);
    messageArea.scrollTop = messageArea.scrollHeight;
  };

  const connect = (event) => {
    username = document.getElementById("name").value.trim();

    if (username) {
      const socket = new SockJS("/ws");
      stompClient = Stomp.over(socket);

      stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
  };

  const onConnected = () => {
    usernamePage.classList.add("hidden");
    chatPage.classList.remove("hidden");

    stompClient.subscribe("/topic/public", onMessageReceived);

    stompClient.send(
      "/app/chat.addUser",
      {},
      JSON.stringify({ sender: username, type: "JOIN" })
    );

    connectingElement.classList.add("hidden");
  };

  const onError = (error) => {
    connectingElement.textContent =
      "Could not connect to WebSocket server. Please refresh this page to try again!";
    connectingElement.style.color = "red";
  };

  const sendMessage = (event) => {
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
      const chatMessage = {
        sender: username,
        content: messageInput.value,
        type: "CHAT",
      };
      stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
      messageInput.value = "";
    }
    event.preventDefault();
  };

  usernameForm.addEventListener("submit", connect, true);
  messageForm.addEventListener("submit", sendMessage, true);

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body).content;
    showMessage(message);
  };
});
