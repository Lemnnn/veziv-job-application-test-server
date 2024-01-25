const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv").config();

const WorkModel = require("./models/Work");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
app.use("/images", express.static(`${__dirname}/images`));

mongoose.connect(process.env.MONGODB_KEY);

app.post("/create", async (req, res) => {
  const { image, title, link, description } = req.body;

  try {
    const work = new WorkModel({
      image,
      title,
      link,
      description,
    });
    await work.save();

    res.status(201).json({ message: "Entry created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating entry" });
  }
});

app.get("/read", async (req, res) => {
  try {
    const result = await WorkModel.find({}).sort({ hidden: 1, createdAt: -1 });
    res.send(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await WorkModel.findByIdAndDelete(id);
    res.send("deleted");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

app.patch("/toggleHidden/:id", async (req, res) => {
  const { id } = req.params;
  const { hidden } = req.body;

  try {
    const updateStatus = await WorkModel.findByIdAndUpdate(
      id,
      { hidden },
      {
        new: true,
      }
    );
    res.status(200).json({ updateStatus });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

app.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { image, title, link, description } = req.body;

  try {
    const updatedCardData = await WorkModel.findByIdAndUpdate(
      id,
      {
        image,
        title,
        link,
        description,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ updatedCardData });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

app.post("/uploadImage", upload.single("image"), async (req, res) => {
  try {
    res.status(201).json({ image: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
