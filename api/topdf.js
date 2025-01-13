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
  try {
    // Periksa apakah ada file yang diunggah
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Tidak ada file yang diunggah.");
    }

    // Buat dokumen PDF baru
    const pdfDoc = await PDFDocument.create();

    // Tambahkan setiap gambar ke PDF
    for (const file of req.files) {
      const imageBytes = file.buffer;
      const imageType = file.mimetype;

      let image;
      if (imageType === "image/jpeg" || imageType === "image/jpg") {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (imageType === "image/png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
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

    // Simpan PDF ke buffer
    const pdfBytes = await pdfDoc.save();

    // Kirim file PDF ke klien
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=converted.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).send("Terjadi kesalahan saat memproses file.");
  }
});

module.exports = app;
