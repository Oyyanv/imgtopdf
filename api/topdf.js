const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

// Konfigurasi Multer untuk menyimpan file sementara di memori
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();

// API untuk mengonversi gambar ke PDF
app.post("/api/topdf", upload.array("images"), async (req, res) => {
    console.log("Files received:", req.files); // Log file yang diterima
  
    try {
      if (!req.files || req.files.length === 0) {
        console.log("No files uploaded.");
        return res.status(400).send("Tidak ada file yang diunggah.");
      }
  
      const pdfDoc = await PDFDocument.create();
      console.log("PDF Document created.");
  
      for (const file of req.files) {
        console.log("Processing file:", file.originalname);
        const imageBytes = file.buffer;
        const imageType = file.mimetype;
  
        let image;
        if (imageType === "image/jpeg" || imageType === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageType === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          console.log("Unsupported file type:", imageType);
          return res.status(400).send("Hanya mendukung file JPG atau PNG.");
        }
  
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
  
      const pdfBytes = await pdfDoc.save();
      console.log("PDF created successfully.");
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=converted.pdf"
      );
      res.send(pdfBytes);
    } catch (error) {
      console.error("Error during PDF conversion:", error);
      res.status(500).send("Terjadi kesalahan saat memproses file.");
    }
  });
  

module.exports = app;
