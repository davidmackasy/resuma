import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
  TabStopPosition,
  TabStopType,
} from "docx";
import type { ResumeJson, CoverLetterJson } from "./generation";

export async function generateResumeDocx(data: ResumeJson): Promise<Buffer> {
  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: data.header.name, bold: true, size: 28, font: "Calibri" })],
    })
  );

  if (data.header.title) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: data.header.title, size: 20, color: "444444", font: "Calibri" })],
      })
    );
  }

  const contactParts: string[] = [];
  if (data.header.email) contactParts.push(data.header.email);
  if (data.header.phone) contactParts.push(data.header.phone);
  if (data.header.location) contactParts.push(data.header.location);
  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: contactParts.join("  |  "), size: 17, color: "555555", font: "Calibri" })],
      })
    );
  }

  const linkParts: string[] = [];
  if (data.header.linkedin) linkParts.push(data.header.linkedin);
  if (data.header.portfolio) linkParts.push(data.header.portfolio);
  if (data.header.github) linkParts.push(data.header.github);
  if (linkParts.length > 0) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: linkParts.join("  |  "), size: 17, color: "555555", font: "Calibri" })],
      })
    );
  }

  sections.push(
    new Paragraph({
      spacing: { after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "333333" } },
      children: [],
    })
  );

  if (data.summary) {
    sections.push(createSectionHeader("PROFESSIONAL SUMMARY"));
    sections.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: data.summary, size: 18, font: "Calibri", color: "333333" })],
      })
    );
  }

  if (data.experience?.length) {
    sections.push(createSectionHeader("EXPERIENCE"));
    for (const role of data.experience) {
      sections.push(
        new Paragraph({
          spacing: { after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: role.title, bold: true, size: 19, font: "Calibri" }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: `${role.startDate} – ${role.endDate}`, size: 17, color: "555555", font: "Calibri" }),
          ],
        })
      );
      const companyLine = [role.company, role.location].filter(Boolean).join(", ");
      if (companyLine) {
        sections.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: companyLine, italics: true, size: 18, color: "444444", font: "Calibri" })],
          })
        );
      }
      for (const bullet of role.bullets || []) {
        if (bullet.trim()) {
          sections.push(
            new Paragraph({
              spacing: { after: 20 },
              indent: { left: 360 },
              bullet: { level: 0 },
              children: [new TextRun({ text: bullet, size: 18, font: "Calibri", color: "333333" })],
            })
          );
        }
      }
      sections.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    }
  }

  if (data.skills?.length) {
    sections.push(createSectionHeader("SKILLS"));
    for (const group of data.skills) {
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${group.name}: `, bold: true, size: 18, font: "Calibri" }),
            new TextRun({ text: group.items.join(", "), size: 18, font: "Calibri" }),
          ],
        })
      );
    }
  }

  if (data.education?.length) {
    sections.push(createSectionHeader("EDUCATION"));
    for (const edu of data.education) {
      const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
      sections.push(
        new Paragraph({
          spacing: { after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: degreeLine || edu.school, bold: true, size: 18, font: "Calibri" }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: edu.year || "", size: 17, color: "555555", font: "Calibri" }),
          ],
        })
      );
      if (degreeLine) {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: edu.school, italics: true, size: 18, color: "444444", font: "Calibri" })],
          })
        );
      }
    }
  }

  if (data.certifications?.length) {
    sections.push(createSectionHeader("CERTIFICATIONS"));
    for (const cert of data.certifications) {
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: cert.name, bold: true, size: 18, font: "Calibri" }),
            new TextRun({ text: ` – ${cert.issuer}${cert.year ? ` (${cert.year})` : ""}`, size: 18, font: "Calibri" }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children: sections }],
  });

  return await Packer.toBuffer(doc);
}

export async function generateCoverLetterDocx(data: CoverLetterJson): Promise<Buffer> {
  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: data.senderName, bold: true, size: 22, font: "Calibri" })],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          size: 20,
          color: "555555",
          font: "Calibri",
        }),
      ],
    })
  );

  if (data.recipientName) {
    sections.push(
      new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: data.recipientName, size: 20, font: "Calibri" })] })
    );
  }
  if (data.recipientTitle) {
    sections.push(
      new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: data.recipientTitle, size: 20, color: "555555", font: "Calibri" })] })
    );
  }
  if (data.companyName) {
    sections.push(
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.companyName, size: 20, font: "Calibri" })] })
    );
  }

  if (data.opening) {
    sections.push(
      new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: data.opening, size: 21, font: "Calibri" })] })
    );
  }

  for (const paragraph of data.body || []) {
    sections.push(
      new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: paragraph, size: 21, font: "Calibri" })] })
    );
  }

  if (data.closing) {
    sections.push(
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: data.closing, size: 21, font: "Calibri" })] })
    );
  }

  sections.push(
    new Paragraph({ children: [new TextRun({ text: data.senderName, bold: true, size: 21, font: "Calibri" })] })
  );

  const doc = new Document({
    sections: [{ children: sections }],
  });

  return await Packer.toBuffer(doc);
}

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    heading: HeadingLevel.HEADING_2,
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    children: [new TextRun({ text, bold: true, size: 20, font: "Calibri", color: "111111" })],
  });
}
