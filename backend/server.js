import express from "express";
import { Sequelize, DataTypes } from "sequelize";
import pkg from "body-parser";
import cors from "cors";
import multer, { diskStorage } from "multer";
import { extname } from "path";

const app = express();
const port = process.env.PORT || 3000;
const { json } = pkg;

app.use(cors());
app.use(json());
app.use(express.static("public"));

// Set up Sequelize
// const { Sequelize } = require("sequelize");

// 環境変数から DATABASE_URL を取得（例：postgres://example:password@db:5432/blog_db）
const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // 開発環境用。実運用では適切なルート証明書を指定してください。
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

async function connectToDatabase() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      break; // Exit the loop if the connection is successful
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts}: Unable to connect to the database:`, error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
    }
  }

  if (attempts === maxAttempts) {
    console.error('Failed to connect to the database after multiple attempts.');
    process.exit(1); // Exit the process if the connection fails after all attempts
  }
}

connectToDatabase();

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
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + extname(file.originalname)
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
