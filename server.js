// server.js
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");

// Servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, "public")));

// Données du jeu
const rooms = {}; // Stocke les salles et leur état
const colors = ["red", "blue", "green", "yellow", "purple"]; // Couleurs des joueurs

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté : " + socket.id);

  // Création d'une salle
  socket.on("create_room", (data) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    rooms[roomCode] = {
      players: [],
      gameStarted: false,
      currentPlayerIndex: 0,
      boardSize: 56,
      safeZoneSize: 6,
    };
    const player = createPlayer(
      socket.id,
      data.playerId,
      data.playerName,
      rooms[roomCode].players.length
    );
    rooms[roomCode].players.push(player);
    io.to(roomCode).emit("player_joined", { players: rooms[roomCode].players });
    socket.emit("room_created", { roomCode: roomCode });
    console.log(`Salle créée : ${roomCode} par ${data.playerName}`);
  });

  // Rejoindre une salle
  socket.on("join_room", (data) => {
    const roomCode = data.roomCode;
    const room = rooms[roomCode];
    if (room && !room.gameStarted && room.players.length < 5) {
      // Vérifier si le joueur est déjà dans la salle
      let player = room.players.find((p) => p.playerId === data.playerId);
      if (!player) {
        // Nouveau joueur
        player = createPlayer(
          socket.id,
          data.playerId,
          data.playerName,
          room.players.length
        );
        room.players.push(player);
      } else {
        // Mettre à jour le socketId du joueur existant
        player.socketId = socket.id;
      }
      socket.join(roomCode);
      io.to(roomCode).emit("player_joined", { players: room.players });
      console.log(`${data.playerName} a rejoint la salle ${roomCode}`);
    } else {
      socket.emit("error_message", { message: "Salle introuvable ou pleine." });
    }
  });

  // Mettre à jour le socketId du joueur
  socket.on("update_socket_id", (data) => {
    const roomCode = data.roomCode;
    const room = rooms[roomCode];
    if (room) {
      const player = room.players.find((p) => p.playerId === data.playerId);
      if (player) {
        player.socketId = socket.id;
        socket.join(roomCode);
        console.log(
          `Socket ID mis à jour pour ${player.name} dans la salle ${roomCode}`
        );
        io.to(roomCode).emit("player_joined", { players: room.players });
      }
    }
  });

  // Commencer le jeu
  socket.on("start_game", (data) => {
    const roomCode = data.roomCode;
    const room = rooms[roomCode];
    const player = getPlayerBySocketId(room, socket.id);
    if (room && player && room.players[0].playerId === player.playerId) {
      room.gameStarted = true;
      io.to(roomCode).emit("game_started");
      console.log(`Le jeu a commencé dans la salle ${roomCode}`);
      startPlayerTurn(roomCode);
    } else {
      socket.emit("error_message", {
        message: "Vous n'êtes pas autorisé à démarrer la partie.",
      });
    }
  });

  // Lancer le dé
  socket.on("roll_dice", (data) => {
    const roomCode = data.roomCode;
    const room = rooms[roomCode];
    const player = getPlayerBySocketId(room, socket.id);

    if (
      room &&
      player &&
      room.players[room.currentPlayerIndex].playerId === player.playerId
    ) {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      socket.emit("dice_rolled", { diceValue: diceValue });
      console.log(
        `${player.name} a lancé un ${diceValue} dans la salle ${roomCode}`
      );

      // Déterminer les actions possibles
      const possibleMoves = getPossibleMoves(player, diceValue, room);
      if (possibleMoves.length > 0) {
        socket.emit("possible_moves", {
          possibleMoves: possibleMoves,
          diceValue: diceValue,
        });
      } else {
        // Si aucun mouvement possible, passer au joueur suivant
        if (diceValue !== 6) {
          room.currentPlayerIndex =
            (room.currentPlayerIndex + 1) % room.players.length;
        }
        io.to(roomCode).emit("update_game_state", { room: room });
        startPlayerTurn(roomCode);
      }
    } else {
      socket.emit("error_message", { message: "Ce n'est pas votre tour." });
    }
  });

  // Déplacer un pion
  socket.on("move_horse", (data) => {
    const roomCode = data.roomCode;
    const room = rooms[roomCode];
    const player = getPlayerBySocketId(room, socket.id);

    if (
      room &&
      player &&
      room.players[room.currentPlayerIndex].playerId === player.playerId
    ) {
      const { horseIndex, action, diceValue } = data;
      const horse = player.horses[horseIndex];

      if (
        action === "enter" &&
        horse.position === "stable" &&
        diceValue === 6
      ) {
        // Sortir le cheval de l'écurie
        horse.position = player.startPosition;
      } else if (
        action === "move" &&
        horse.position !== "stable" &&
        horse.position !== "finished"
      ) {
        // Déplacer le cheval
        horse.position = moveHorse(horse.position, diceValue, player, room);
      }

      // Vérifier s'il y a des chevaux adverses à la même position
      captureHorse(horse.position, player.color, room);

      // Vérifier si le joueur a gagné
      if (player.horses.every((h) => h.position === "finished")) {
        io.to(roomCode).emit("game_over", { winner: player.name });
        console.log(`${player.name} a gagné dans la salle ${roomCode}`);
        delete rooms[roomCode];
        return;
      }

      // Mettre à jour l'état du jeu pour tous les joueurs
      io.to(roomCode).emit("update_game_state", { room: room });

      // Si le joueur n'a pas lancé un 6, passer au joueur suivant
      if (diceValue !== 6) {
        room.currentPlayerIndex =
          (room.currentPlayerIndex + 1) % room.players.length;
      }
      startPlayerTurn(roomCode);
    } else {
      socket.emit("error_message", { message: "Ce n'est pas votre tour." });
    }
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté : " + socket.id);
    // Gérer la déconnexion du joueur
    removePlayerFromRooms(socket.id);
  });
});

// Fonctions utilitaires
function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

function createPlayer(socketId, playerId, name, index) {
  return {
    socketId: socketId,
    playerId: playerId,
    name: name,
    color: colors[index],
    horses: [
      { position: "stable" },
      { position: "stable" },
      { position: "stable" },
      { position: "stable" },
    ],
    startPosition: index * 14, // Position de départ sur le plateau
    homePath: Array.from({ length: 6 }, (_, i) => 56 + index * 6 + i + 1), // Cases de la zone d'arrivée
  };
}

function getPlayerBySocketId(room, socketId) {
  return room.players.find((player) => player.socketId === socketId);
}

function startPlayerTurn(roomCode) {
  const room = rooms[roomCode];
  const currentPlayer = room.players[room.currentPlayerIndex];
  io.to(roomCode).emit("player_turn", { playerId: currentPlayer.playerId });
  io.to(currentPlayer.socketId).emit("your_turn");
  console.log(
    `C'est le tour de ${currentPlayer.name} dans la salle ${roomCode}`
  );
}

function getPossibleMoves(player, diceValue, room) {
  const possibleMoves = [];
  player.horses.forEach((horse, index) => {
    if (horse.position === "stable" && diceValue === 6) {
      possibleMoves.push({ horseIndex: index, action: "enter" });
    } else if (horse.position !== "stable" && horse.position !== "finished") {
      possibleMoves.push({ horseIndex: index, action: "move" });
    }
  });
  return possibleMoves;
}

function moveHorse(position, diceValue, player, room) {
  let newPosition;
  const boardSize = room.boardSize;

  if (typeof position === "number") {
    // Cheval sur le plateau principal
    newPosition = (position + diceValue) % boardSize;

    // Vérifier si le cheval entre dans la zone d'arrivée
    if (
      hasCompletedFullCircle(
        position,
        newPosition,
        player.startPosition,
        boardSize
      )
    ) {
      const stepsIntoHome =
        (newPosition - player.startPosition + boardSize) % boardSize;
      if (stepsIntoHome <= player.homePath.length) {
        newPosition = player.homePath[stepsIntoHome - 1];
      }
    }
  } else if (player.homePath.includes(position)) {
    // Cheval dans la zone d'arrivée
    const indexInHome = player.homePath.indexOf(position);
    if (indexInHome + diceValue < player.homePath.length) {
      newPosition = player.homePath[indexInHome + diceValue];
    } else if (indexInHome + diceValue === player.homePath.length) {
      newPosition = "finished";
    } else {
      newPosition = position; // Ne peut pas avancer
    }
  }

  return newPosition;
}

function hasCompletedFullCircle(oldPos, newPos, startPosition, boardSize) {
  if (oldPos <= startPosition && newPos >= startPosition) {
    return true;
  }
  if (startPosition === 0 && newPos >= boardSize - 1) {
    return true;
  }
  return false;
}

function captureHorse(position, color, room) {
  room.players.forEach((player) => {
    if (player.color !== color) {
      player.horses.forEach((horse) => {
        if (horse.position === position && typeof position === "number") {
          horse.position = "stable";
          console.log(`Cheval capturé à la position ${position}`);
        }
      });
    }
  });
}

function removePlayerFromRooms(socketId) {
  for (const roomCode in rooms) {
    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(
      (player) => player.socketId === socketId
    );
    if (playerIndex !== -1) {
      const playerName = room.players[playerIndex].name;
      room.players.splice(playerIndex, 1);
      io.to(roomCode).emit("player_left", { playerId: socketId });
      console.log(`${playerName} a quitté la salle ${roomCode}`);
      if (room.players.length === 0) {
        delete rooms[roomCode];
        console.log(`Salle ${roomCode} supprimée car vide`);
      } else if (room.currentPlayerIndex >= room.players.length) {
        room.currentPlayerIndex = 0;
      }
      break;
    }
  }
}

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
