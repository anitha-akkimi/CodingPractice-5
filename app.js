const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/movies");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDatabase();
const convertDbObjectToResponseObject = (dbObject) => {
  const responseObject = {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
  return responseObject;
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// getting all movie names API

app.get("/movies/", async (request, response) => {
  const getMovieNames = `
    SELECT movie_name FROM movie
    ORDER BY movie_id;
    `;

  const getMoviesArray = await db.all(getMovieNames);
  response.send(
    getMoviesArray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

// add new movie API

app.post("/movies/", async (request, response) => {
  movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  const addMoviesDetailsQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (${director_id}, '${movie_name}', '${lead_actor}');
    `;

  const dbResponse = await db.run(addMoviesDetailsQuery);
  const movieID = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

// get one selected movie API

app.get("/movies/:movie_id", async (request, response) => {
  const { movie_id } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie
    WHERE movie_id = ${movie_id};
    `;

  const dbResponse = await db.get(getMovieQuery);
  const movieDetails = convertDbObjectToResponseObject(dbResponse);
  response.send(movieDetails);
});

// update movie details API
app.put("/movies/:movie_id/", async (request, response) => {
  const { movie_id } = request.params;
  const movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  const updateMovieQuery = `

  UPDATE movie
  SET 
  director_id=${director_id},
  movie_name='${movie_name}',
  lead_actor='${lead_actor}'

  WHERE movie_id = ${movie_id};
  `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// Delete movie API

app.delete("/movies/:movie_id/", async (request, response) => {
  const { movie_id } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movie_id};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//getting directors list API

app.get("/directors/", async (request, response) => {
  const directorDetails = `
    SELECT * FROM director
    ORDER BY director_id
    `;
  const directorsList = await db.all(directorDetails);
  response.send(
    directorsList.map((eachDirector) =>
      convertDbObjectToResponseObject2(eachDirector)
    )
  );
});

// get list of movies by specific director API

app.get("/directors/:director_id/movies/", async (request, response) => {
  const { director_id } = request.params;
  const getMoviesQuery = `
    SELECT movie_name FROM movie
    WHERE director_id = ${director_id};
    `;

  const directorMoviesList = await db.all(getMoviesQuery);
  response.send(
    directorMoviesList.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;
