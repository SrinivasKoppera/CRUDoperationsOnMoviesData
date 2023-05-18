const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://30000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//ConvertDbFormatToClientFormat
const convertDBObjTOClientObj = (dbObj) => {
  let obj = {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
  return obj;
};

//1.GET Movie Names API
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT 
    *
    FROM 
        movie
    ORDER BY
        movie_id;`;
  const getMovieNames = await db.all(getMovieNamesQuery);
  response.send(
    getMovieNames.map((eachMovie) => {
      let obj = { movieName: eachMovie.movie_name };
      return obj;
    })
  );
});

//2.Create a New Movie API
app.post("/movies/", async (request, response) => {
  const newMovieData = request.body;
  const { directorId, movieName, leadActor } = newMovieData;
  const addNewMovieQuery = `
    INSERT INTO
        movie(director_id, movie_name, lead_actor)
    VALUES
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );`;
  const newMovieId = await db.run(addNewMovieQuery);
  response.send("Movie Successfully Added");
});

//3.GET single Movie Details API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
    *
    FROM
        movie
    WHERE 
        movie_id = ${movieId};`;
  const movieDetails = await db.all(getMovieQuery);
  response.send(movieDetails.map((each) => convertDBObjTOClientObj(each)));
});

//4.Update the Movie Details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const newDetailsOfMovie = request.body;
  const { directorId, movieName, leadActor } = newDetailsOfMovie;
  const updateMovieQuery = `
    UPDATE 
        movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}';`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//5.Delete movie Details API

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//6.GET Directors Details API
app.get("/directors/", async (request, response) => {
  const getDirectorsDetailsQuery = `
    SELECT 
    *
    FROM 
        director;`;
  const directorsDetails = await db.all(getDirectorsDetailsQuery);
  response.send(
    directorsDetails.map((eachDirector) => {
      const serverObj = {
        directorId: eachDirector.director_id,
        directorName: eachDirector.director_name,
      };
      return serverObj;
    })
  );
});

//7.GET a Specific Movie Details Directed by Specific Director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  const getMovieDetailsQuery = `
    SELECT
    *
    FROM
        movie
    WHERE
        director_id = ${directorId};`;
  const dbRep = await db.all(getMovieDetailsQuery);
  response.send(
    dbRep.map((eachMovie) => {
      const obj = {
        movieName: eachMovie.movie_name,
      };
      return obj;
    })
  );
});

// Express instance Export
module.exports = app;
