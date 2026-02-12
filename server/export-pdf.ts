import PDFDocument from "pdfkit";
import type { ResumeJson, CoverLetterJson } from "./generation";

function collectBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

const COLORS = {
  black: "#111111",
  dark: "#333333",
  medium: "#555555",
  light: "#888888",
  line: "#CCCCCC",
};

export async function generateResumePdf(data: ResumeJson): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 40, bottom: 40, left: 50, right: 50 } });
  const pageWidth = doc.page.width - 100;
  let y = 40;

  doc.font("Helvetica-Bold").fontSize(18).fillColor(COLORS.black);
  doc.text(data.header.name, 50, y, { align: "center", width: pageWidth });
  y += 24;

  if (data.header.title) {
    doc.font("Helvetica").fontSize(11).fillColor(COLORS.medium);
    doc.text(data.header.title, 50, y, { align: "center", width: pageWidth });
    y += 16;
  }

  const contactParts: string[] = [];
  if (data.header.email) contactParts.push(data.header.email);
  if (data.header.phone) contactParts.push(data.header.phone);
  if (data.header.location) contactParts.push(data.header.location);
  if (contactParts.length) {
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.medium);
    doc.text(contactParts.join("  |  "), 50, y, { align: "center", width: pageWidth });
    y += 13;
  }

  const linkParts: string[] = [];
  if (data.header.linkedin) linkParts.push(data.header.linkedin);
  if (data.header.portfolio) linkParts.push(data.header.portfolio);
  if (data.header.github) linkParts.push(data.header.github);
  if (linkParts.length) {
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.medium);
    doc.text(linkParts.join("  |  "), 50, y, { align: "center", width: pageWidth });
    y += 13;
  }

  y += 4;
  doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor(COLORS.dark).lineWidth(0.5).stroke();
  y += 10;

  if (data.summary) {
    y = drawSectionHeader(doc, "PROFESSIONAL SUMMARY", y, pageWidth);
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.dark);
    doc.text(data.summary, 50, y, { width: pageWidth, lineGap: 2 });
    y = doc.y + 12;
  }

  if (data.experience?.length) {
    y = drawSectionHeader(doc, "EXPERIENCE", y, pageWidth);
    for (const role of data.experience) {
      y = checkPage(doc, y, 60);
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.black);
      doc.text(role.title, 50, y, { continued: false, width: pageWidth * 0.65 });

      doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.medium);
      const dateStr = `${role.startDate} - ${role.endDate}`;
      doc.text(dateStr, 50, y, { align: "right", width: pageWidth });
      y += 13;

      const companyLine = [role.company, role.location].filter(Boolean).join(", ");
      if (companyLine) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(COLORS.medium);
        doc.text(companyLine, 50, y, { width: pageWidth });
        y = doc.y + 3;
      }

      for (const bullet of role.bullets || []) {
        if (!bullet.trim()) continue;
        y = checkPage(doc, y, 15);
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.dark);
        doc.text(`\u2022  ${bullet}`, 60, y, { width: pageWidth - 10, lineGap: 1 });
        y = doc.y + 2;
      }
      y += 6;
    }
  }

  if (data.skills?.length) {
    y = checkPage(doc, y, 40);
    y = drawSectionHeader(doc, "SKILLS", y, pageWidth);
    for (const group of data.skills) {
      y = checkPage(doc, y, 14);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.black);
      doc.text(`${group.name}: `, 50, y, { continued: true });
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.dark);
      doc.text(group.items.join(", "), { lineGap: 1 });
      y = doc.y + 3;
    }
  }

  if (data.education?.length) {
    y = checkPage(doc, y, 40);
    y = drawSectionHeader(doc, "EDUCATION", y, pageWidth);
    for (const edu of data.education) {
      y = checkPage(doc, y, 20);
      const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.black);
      doc.text(degreeLine || edu.school, 50, y, { width: pageWidth * 0.7 });

      doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.medium);
      doc.text(edu.year || "", 50, y, { align: "right", width: pageWidth });
      y += 13;

      if (degreeLine) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(COLORS.medium);
        doc.text(edu.school, 50, y, { width: pageWidth });
        y = doc.y + 4;
      }
    }
  }

  if (data.certifications?.length) {
    y = checkPage(doc, y, 40);
    y = drawSectionHeader(doc, "CERTIFICATIONS", y, pageWidth);
    for (const cert of data.certifications) {
      y = checkPage(doc, y, 14);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.black);
      doc.text(cert.name, 50, y, { continued: true });
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.dark);
      doc.text(` - ${cert.issuer}${cert.year ? ` (${cert.year})` : ""}`, { lineGap: 1 });
      y = doc.y + 3;
    }
  }

  return collectBuffer(doc);
}

export async function generateCoverLetterPdf(data: CoverLetterJson): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 60, bottom: 60, left: 65, right: 65 } });
  const pageWidth = doc.page.width - 130;
  let y = 60;

  doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.black);
  doc.text(data.senderName, 65, y, { width: pageWidth });
  y = doc.y + 6;

  const dateStr = data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.medium);
  doc.text(dateStr, 65, y, { width: pageWidth });
  y = doc.y + 20;

  if (data.recipientName) {
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.black);
    doc.text(data.recipientName, 65, y, { width: pageWidth });
    y = doc.y + 2;
  }
  if (data.recipientTitle) {
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.medium);
    doc.text(data.recipientTitle, 65, y, { width: pageWidth });
    y = doc.y + 2;
  }
  if (data.companyName) {
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.black);
    doc.text(data.companyName, 65, y, { width: pageWidth });
    y = doc.y + 16;
  }

  if (data.opening) {
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.black);
    doc.text(data.opening, 65, y, { width: pageWidth, lineGap: 3 });
    y = doc.y + 12;
  }

  for (const paragraph of data.body || []) {
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.black);
    doc.text(paragraph, 65, y, { width: pageWidth, lineGap: 3 });
    y = doc.y + 12;
  }

  if (data.closing) {
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.black);
    doc.text(data.closing, 65, y, { width: pageWidth, lineGap: 3 });
    y = doc.y + 24;
  }

  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(COLORS.black);
  doc.text(data.senderName, 65, y, { width: pageWidth });

  return collectBuffer(doc);
}

function drawSectionHeader(doc: PDFKit.PDFDocument, text: string, y: number, pageWidth: number): number {
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.black);
  doc.text(text, 50, y, { width: pageWidth });
  y = doc.y + 2;
  doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor(COLORS.line).lineWidth(0.4).stroke();
  return y + 6;
}

function checkPage(doc: PDFKit.PDFDocument, y: number, needed: number): number {
  if (y + needed > doc.page.height - 40) {
    doc.addPage();
    return 40;
  }
  return y;
}
