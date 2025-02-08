const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Set up Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Define the Article model
const Article = sequelize.define("Article", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// API endpoints
app.get("/articles", async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve articles" });
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve article" });
  }
});

app.post("/articles", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const article = await Article.create({
      title,
      content,
      image,
    });
    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create article" });
  }
});

app.put("/articles/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const article = await Article.findByPk(req.params.id);
    if (article) {
      await article.update({
        title,
        content,
        image: image || article.image,
      });
      res.json(article);
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update article" });
  }
});

app.delete("/articles/:id", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (article) {
      await article.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

// Sync the database and start the server
sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
