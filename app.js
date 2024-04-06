const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();
app.use(express.json());
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

app.post("/avatar", (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: "Please upload an image" });
  }
  res.json({ message: "Image uploaded", path: file.path });
});

app.get("/pdf", (req, res) => {
  const fileName = `pdf-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, "pdfs", fileName);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.pipe(res);
  doc.fontSize(25).text("Hello World");
  doc.end();
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

app.listen(3000);
