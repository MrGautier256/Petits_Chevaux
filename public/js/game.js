// public/js/game.js

const socket = io();
const playerName = localStorage.getItem("playerName");
const roomCode = localStorage.getItem("roomCode");
const playerId = localStorage.getItem("playerId");

let currentPlayerId = null;
let gameState = null;

// Mettre à jour le socketId du joueur pour que le serveur le reconnaisse
socket.emit("update_socket_id", { roomCode: roomCode, playerId: playerId });

// Rejoindre la salle de jeu si nécessaire
if (!localStorage.getItem("isInGame")) {
  socket.emit("join_room", {
    playerName: playerName,
    roomCode: roomCode,
    playerId: playerId,
  });
  localStorage.setItem("isInGame", "true");
}

// Recevoir le tour du joueur
socket.on("your_turn", () => {
  document.getElementById("gameInfo").innerText = "C'est votre tour !";
  document.getElementById("rollDiceButton").disabled = false;
});

// Recevoir l'ID du joueur actuel
socket.on("player_turn", (data) => {
  currentPlayerId = data.playerId;
  if (currentPlayerId !== playerId) {
    document.getElementById("gameInfo").innerText =
      "En attente du tour des autres joueurs...";
  }
});

// Lancer le dé
document.getElementById("rollDiceButton").addEventListener("click", () => {
  socket.emit("roll_dice", { roomCode: roomCode });
  document.getElementById("rollDiceButton").disabled = true;
});

// Recevoir le résultat du dé
socket.on("dice_rolled", (data) => {
  document.getElementById(
    "diceResult"
  ).innerText = `Vous avez lancé un ${data.diceValue}`;
});

// Recevoir les mouvements possibles
socket.on("possible_moves", (data) => {
  const possibleMovesDiv = document.getElementById("possibleMoves");
  possibleMovesDiv.innerHTML = "";

  data.possibleMoves.forEach((move) => {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary", "m-1");
    if (move.action === "enter") {
      button.innerText = `Sortir le cheval ${move.horseIndex + 1} de l'écurie`;
    } else if (move.action === "move") {
      button.innerText = `Déplacer le cheval ${move.horseIndex + 1}`;
    }
    button.addEventListener("click", () => {
      socket.emit("move_horse", {
        roomCode: roomCode,
        horseIndex: move.horseIndex,
        action: move.action,
        diceValue: data.diceValue,
      });
      possibleMovesDiv.innerHTML = "";
    });
    possibleMovesDiv.appendChild(button);
  });
});

// Mettre à jour l'état du jeu
socket.on("update_game_state", (data) => {
  gameState = data.room;
  renderGameBoard();
});

// Fin du jeu
socket.on("game_over", (data) => {
  alert(`Le jeu est terminé. ${data.winner} a gagné !`);
  localStorage.removeItem("isInGame");
  window.location.href = "index.html";
});

// Fonction pour afficher le plateau de jeu
function renderGameBoard() {
  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  // Afficher les cases du plateau (simplifié)
  for (let i = 0; i < gameState.boardSize; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.style.left = `${(i % 14) * 35}px`;
    square.style.top = `${Math.floor(i / 14) * 35}px`;
    square.innerText = i;
    gameBoard.appendChild(square);
  }

  // Afficher les chevaux
  gameState.players.forEach((player) => {
    player.horses.forEach((horse, index) => {
      if (horse.position !== "stable" && horse.position !== "finished") {
        const horseDiv = document.createElement("div");
        horseDiv.classList.add("horse");
        horseDiv.style.backgroundColor = player.color;
        if (typeof horse.position === "number") {
          horseDiv.style.left = `${(horse.position % 14) * 35 + 5}px`;
          horseDiv.style.top = `${Math.floor(horse.position / 14) * 35 + 5}px`;
        } else {
          // Positionner les chevaux dans la zone d'arrivée
          horseDiv.style.left = `${index * 35 + 5}px`;
          horseDiv.style.top = `${
            player.homePath.indexOf(horse.position) * 35 + 5
          }px`;
        }
        gameBoard.appendChild(horseDiv);
      }
    });
  });
}

socket.on("error_message", (data) => {
  alert(data.message);
});
