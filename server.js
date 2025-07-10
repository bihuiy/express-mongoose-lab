import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import "dotenv/config";
import methodOverride from "method-override";

const app = express();
const port = process.env.PORT;

// middleware
app.use(express.urlencoded()); // Without this line, all payload data will be undefined in our routes
app.use(morgan("dev"));
app.use(methodOverride("_method"));

// define a schema
const songSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  releaseYear: String,
});

// compile the schema into a model/function
const Song = mongoose.model("Song", songSchema);

// index - display all songs, requires asynchronous database operations
app.get("/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    return res.render("songs/index.ejs", {
      allSongs: songs,
    });
  } catch (error) {
    console.log(error);
    //return res.render("Couldn't fetch songs");
  }
});

// new - show a form to add a new song, displays a static form page that doesn’t require data from the database
app.get("/songs/new", (req, res) => {
  return res.render("songs/new.ejs");
});

// show - display a specific song's details, requires asynchronous database querying
app.get("/songs/:songId", async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    return res.render("songs/show.ejs", {
      song: song,
    });
  } catch (error) {
    console.log(error);
    //res.render(`Couldn't fetch the song with this id: ${req.params.songId}`)
  }
});

// edit - show a form to edit an existing song's details
app.get("/songs/:songId/edit", async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    return res.render("songs/edit.ejs", {
      song: song,
    });
  } catch (error) {
    console.log(error);
  }
});

// update - update a specific song's details
app.put("/songs/:songId", async (req, res) => {
  try {
    const updateSong = await Song.findByIdAndUpdate(req.params.songId, req.body);
    return res.redirect(`/songs/${updateSong._id}`);
  } catch (error) {
    console.log(error);
  }
});

// create - add a new song to the list, requires asynchronous database writing
app.post("/songs", async (req, res) => {
  try {
    const createdSong = await Song.create(req.body);
    return res.redirect(`/songs/${createdSong._id}`);
  } catch (error) {
    console.log(error);
  }
});

// delete - remove a specific song from the list
app.delete("/songs/:songId", async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.songId);
    return res.redirect("/songs");
  } catch (error) {
    console.log(error);
  }
});

const init = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
    app.listen(port, () =>
      console.log(`Server up and running on port ${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};

init();
