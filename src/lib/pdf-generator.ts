import "server-only";
import path from "path";
import fs from "fs";
import { PDFDocument, rgb, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type PdfReportInput = {
  userName: string;
  userEmail: string;
  reportName: string;
  reportDate: string;
  english: string;
  yoruba: string;
  hausa: string;
  igbo: string;
  extractedText?: string;
};

const FONT_PATH = path.join(process.cwd(), "public", "fonts");
const MARGIN = 60;

function loadFontBytes(name: string): Uint8Array {
  return fs.readFileSync(path.join(FONT_PATH, name));
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .replace(/\*\*/g, "")
    .replace(/^#+\s+/gm, "")
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  fontSize: number,
  maxW: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxW) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function isHeader(para: string): boolean {
  return (
    para.length < 85 &&
    (para.endsWith(":") ||
      /^\d+\./.test(para) ||
      para.toUpperCase() === para)
  );
}

async function renderSection(
  doc: PDFDocument,
  paragraphs: string[],
  title: string,
  regularFont: PDFFont,
  boldFont: PDFFont,
  page: ReturnType<typeof doc.addPage>,
  yPos: number
): Promise<{ page: typeof page; yPos: number }> {
  const { width, height } = page.getSize();
  const maxW = width - MARGIN * 2;
  const bodySize = 9;
  const headerSize = 11;
  let currentPage = page;
  let y = yPos;

  if (y - 30 < MARGIN) {
    currentPage = doc.addPage([width, height]);
    y = height - MARGIN;
  }

  currentPage.drawText(title, {
    x: MARGIN, y,
    size: headerSize,
    font: boldFont,
    color: rgb(0.15, 0.35, 0.6),
  });
  y -= 22;

  currentPage.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + 80, y },
    thickness: 1.5,
    color: rgb(0.15, 0.35, 0.6),
  });
  y -= 14;

  for (const para of paragraphs) {
    const isHead = isHeader(para);
    const fSize = isHead ? bodySize + 1 : bodySize;
    const fnt = isHead ? boldFont : regularFont;
    const textColor = isHead
      ? rgb(0.15, 0.35, 0.6)
      : rgb(0.15, 0.15, 0.15);

    const displayText = para.replace(/^[•\-*]\s*/, "");
    const lines = wrapText(displayText, { widthOfTextAtSize: (t, s) => fnt.widthOfTextAtSize(t, s) }, fSize, maxW);
    if (lines.length === 0) continue;

    const blockHeight = lines.length * (fSize * 1.45) + 4;
    if (y - blockHeight < MARGIN) {
      currentPage = doc.addPage([width, height]);
      y = height - MARGIN;
    }

    for (const line of lines) {
      currentPage.drawText(line, {
        x: MARGIN + (isHead ? 0 : 5),
        y,
        size: fSize,
        font: fnt,
        color: textColor,
      });
      y -= fSize * 1.45;
    }
    y -= 4;
  }

  return { page: currentPage, yPos: y };
}

export async function generateReportPdf(input: PdfReportInput): Promise<Uint8Array> {
  const regularBytes = loadFontBytes("NotoSans-Regular.ttf");
  const boldBytes = loadFontBytes("NotoSans-Bold.ttf");

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const regularFont = await doc.embedFont(regularBytes);
  const boldFont = await doc.embedFont(boldBytes);

  const { width, height } = doc.addPage().getSize();
  let page = doc.getPage(0);
  let y = height - MARGIN;

  // ─── Cover ───
  page.drawText("WazobiCare Nigeria", {
    x: MARGIN, y,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.3, 0.55),
  });
  y -= 10;

  page.drawText("Clinical Lab Report", {
    x: MARGIN, y,
    size: 13,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 36;

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: width - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 24;

  // ─── Info ───
  const infoLines: [string, string][] = [
    ["Patient Name", input.userName],
    ["Email", input.userEmail],
    ["Report", input.reportName],
    ["Date Analyzed", input.reportDate],
  ];

  for (const [label, value] of infoLines) {
    page.drawText(label, {
      x: MARGIN, y,
      size: 8,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(value, {
      x: MARGIN + 100, y,
      size: 9,
      font: regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 16;
  }

  y -= 20;

  // ─── Language Sections ───
  const sections: { title: string; text: string }[] = [
    { title: "English", text: input.english },
    { title: "Yoruba (Èdè Yorùbá)", text: input.yoruba },
    { title: "Hausa (Harshen Hausa)", text: input.hausa },
    { title: "Igbo (Asụsụ Igbo)", text: input.igbo },
  ];

  for (const section of sections) {
    const result = await renderSection(
      doc, splitIntoParagraphs(section.text), section.title,
      regularFont, boldFont, page, y
    );
    page = result.page;
    y = result.yPos - 20;
  }

  // ─── OCR Text ───
  if (input.extractedText) {
    if (y - 30 < MARGIN) {
      page = doc.addPage([width, height]);
      y = height - MARGIN;
    }

    page.drawText("Original OCR Text", {
      x: MARGIN, y,
      size: 11,
      font: boldFont,
      color: rgb(0.15, 0.35, 0.6),
    });
    y -= 22;

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: MARGIN + 80, y },
      thickness: 1.5,
      color: rgb(0.15, 0.35, 0.6),
    });
    y -= 14;

    const maxW = width - MARGIN * 2;
    const ocrLines = input.extractedText.split("\n").filter(Boolean);
    for (const line of ocrLines) {
      const wrapped = wrapText(line, { widthOfTextAtSize: (t, s) => regularFont.widthOfTextAtSize(t, s) }, 7, maxW);
      if (y - wrapped.length * 10 - 10 < MARGIN) {
        page = doc.addPage([width, height]);
        y = height - MARGIN;
      }
      for (const w of wrapped) {
        page.drawText(w, {
          x: MARGIN, y,
          size: 7,
          font: regularFont,
          color: rgb(0.4, 0.4, 0.4),
        });
        y -= 10;
      }
    }
    y -= 14;
  }

  // ─── Disclaimer ───
  if (y - 50 < MARGIN) {
    page = doc.addPage([width, height]);
    y = height - MARGIN;
  }

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: width - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 18;

  page.drawText("Disclaimer", {
    x: MARGIN, y,
    size: 8,
    font: boldFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 13;

  const disclaimer =
    "WazobiCare provides educational translations and AI-powered analysis of lab reports. " +
    "This document is not a clinical diagnosis. Always consult a qualified healthcare professional " +
    "for medical decisions. Generated by WazobiCare Nigeria.";
  const maxW = width - MARGIN * 2;
  const discLines = wrapText(disclaimer, { widthOfTextAtSize: (t, s) => regularFont.widthOfTextAtSize(t, s) }, 7, maxW);
  for (const line of discLines) {
    page.drawText(line, {
      x: MARGIN, y,
      size: 7,
      font: regularFont,
      color: rgb(0.55, 0.55, 0.55),
    });
    y -= 11;
  }

  // ─── Page Numbers ───
  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = doc.getPage(i);
    p.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: width / 2 - 20,
      y: 30,
      size: 7,
      font: regularFont,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return doc.save();
}
