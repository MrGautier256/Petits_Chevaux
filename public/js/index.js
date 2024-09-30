// public/js/index.js

const socket = io();

// Générer un playerId unique s'il n'existe pas
if (!localStorage.getItem("playerId")) {
  const playerId = generatePlayerId();
  localStorage.setItem("playerId", playerId);
}

function generatePlayerId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

const playerId = localStorage.getItem("playerId");

// Création d'une salle
document.getElementById("createRoomForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const playerName = document.getElementById("playerName").value;
  localStorage.setItem("playerName", playerName);
  localStorage.setItem("isCreator", "true");
  socket.emit("create_room", { playerName: playerName, playerId: playerId });
});

socket.on("room_created", (data) => {
  localStorage.setItem("roomCode", data.roomCode);
  window.location.href = `lobby.html`;
});

// Rejoindre une salle
document.getElementById("joinRoomForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const playerName = document.getElementById("playerNameJoin").value;
  const roomCode = document.getElementById("roomCode").value.toUpperCase();
  localStorage.setItem("playerName", playerName);
  localStorage.setItem("roomCode", roomCode);
  localStorage.setItem("isCreator", "false");
  socket.emit("join_room", {
    playerName: playerName,
    roomCode: roomCode,
    playerId: playerId,
  });
});

socket.on("error_message", (data) => {
  alert(data.message);
});
