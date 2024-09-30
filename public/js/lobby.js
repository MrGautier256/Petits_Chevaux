// public/js/lobby.js

const socket = io();
const playerName = localStorage.getItem("playerName");
const roomCode = localStorage.getItem("roomCode");
const isCreator = localStorage.getItem("isCreator") === "true";
const playerId = localStorage.getItem("playerId");

document.getElementById(
  "roomCodeDisplay"
).innerText = `Code de la salle : ${roomCode}`;

// Mettre à jour le socketId du joueur pour que le serveur le reconnaisse
socket.emit("update_socket_id", { roomCode: roomCode, playerId: playerId });

if (!isCreator) {
  socket.emit("join_room", {
    playerName: playerName,
    roomCode: roomCode,
    playerId: playerId,
  });
}

socket.on("player_joined", (data) => {
  const playersList = document.getElementById("playersList");
  playersList.innerHTML = "";
  data.players.forEach((player) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerText = player.name;
    playersList.appendChild(li);
  });
});

document.getElementById("startGameButton").addEventListener("click", () => {
  socket.emit("start_game", { roomCode: roomCode });
});

socket.on("game_started", () => {
  window.location.href = `game.html`;
});

socket.on("error_message", (data) => {
  alert(data.message);
});
