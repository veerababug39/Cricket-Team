const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get Players Query

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
            *
        FROM 
            cricket_team;`;
  const playersDetails = await db.all(getPlayersQuery);
  response.send(
    playersDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Add Player Details

app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const addPlayerQuery = `
        INSERT INTO
        cricket_team (player_name,jersey_number,role)
        VALUES
        (
            '${playerName}',
            ${jerseyNumber},
            '${role}'
        );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get Player Details

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT 
            * 
        FROM 
            cricket_team
        WHERE 
            player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//Update Player Details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
    cricket_team
    SET 
        player_id = ${playerId},
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE 
        player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE 
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
