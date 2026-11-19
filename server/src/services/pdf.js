import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { env } from "./../config/env.js";

const storageRoot = path.resolve(process.cwd(), "storage", "pdfs");

export async function generatePdf(filename, render) {
  await fs.promises.mkdir(storageRoot, { recursive: true });
  const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.pdf$/i, "") || "document";
  const outputName = `${safeName}-${Date.now()}.pdf`;
  const outputPath = path.join(storageRoot, outputName);
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const stream = fs.createWriteStream(outputPath);
    stream.on("finish", resolve).on("error", reject);
    doc.on("error", reject);
    doc.pipe(stream);
    try { render(doc); doc.end(); } catch (error) { doc.destroy(error); }
  });
  return `${env.PDF_BASE_URL.replace(/\/$/, "")}/pdfs/${encodeURIComponent(outputName)}`;
}

export function renderMetricTable(doc, metrics) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  for (const [key, value] of Object.entries(metrics ?? {})) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 30) doc.addPage();
    const y = doc.y;
    doc.font("Helvetica-Bold").text(String(key), left, y, { width: (right - left) / 2 });
    doc.font("Helvetica").text(typeof value === "object" ? JSON.stringify(value) : String(value ?? ""), left + (right - left) / 2, y, { width: (right - left) / 2 });
    doc.moveDown(0.7);
  }
}
