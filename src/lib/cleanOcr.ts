/**
 * OCR text cleaning utility.
 * Preserves medical values and units while removing OCR noise.
 */

// Common medical units to preserve
const MEDICAL_UNITS = [
  "mg/dL", "g/dL", "mmol/L", "mEq/L", "IU/L", "U/L", "ng/mL", "pg/mL",
  "μg/dL", "mcg/dL", "mIU/L", "nmol/L", "pmol/L", "%", "cells/μL",
  "10^3/μL", "10^6/μL", "mm/hr", "mmHg", "bpm", "fl", "pg",
];

export function cleanOcrText(rawText: string): string {
  let cleaned = rawText;

  // Remove null bytes and control characters (except newlines/tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove excessive whitespace on a single line (more than 3 spaces → 2)
  cleaned = cleaned.replace(/[ \t]{3,}/g, "  ");

  // Remove lines that are purely noise (symbols repeated more than 3 times)
  cleaned = cleaned
    .split("\n")
    .filter((line) => {
      const stripped = line.trim();
      // Keep empty lines for formatting
      if (stripped.length === 0) return true;
      // Remove lines that are only symbols/dashes/underscores
      if (/^[-=_*#|~.]{3,}$/.test(stripped)) return false;
      // Remove lines that are just random characters (no alphanumeric)
      if (!/[a-zA-Z0-9]/.test(stripped)) return false;
      return true;
    })
    .join("\n");

  // Collapse more than 3 consecutive blank lines into 2
  cleaned = cleaned.replace(/\n{4,}/g, "\n\n\n");

  // Fix common OCR mistakes for medical terms
  cleaned = cleaned
    .replace(/\bHaemog1obin\b/gi, "Haemoglobin")
    .replace(/\bHemog1obin\b/gi, "Hemoglobin")
    .replace(/\bG1ucose\b/gi, "Glucose")
    .replace(/\bCreatinine\b/gi, "Creatinine")
    .replace(/0(?=[a-zA-Z])/g, "O") // Leading 0 before letters → O
    .replace(/l(?=\d)/g, "1"); // Lowercase l before digit → 1

  // Trim overall
  cleaned = cleaned.trim();

  return cleaned;
}

export function isValidLabText(text: string): boolean {
  if (!text || text.trim().length < 20) return false;

  // Check if it contains any medical indicators
  const medicalKeywords = [
    "glucose", "hemoglobin", "haemoglobin", "creatinine", "cholesterol",
    "sodium", "potassium", "calcium", "platelet", "white blood", "red blood",
    "WBC", "RBC", "HGB", "HCT", "MCV", "MCH", "MCHC", "PLT", "ALT", "AST",
    "bilirubin", "urea", "albumin", "protein", "thyroid", "TSH", "T3", "T4",
    "result", "reference", "normal", "range", "test", "lab", "laboratory",
    "patient", "specimen", "sample", "report",
  ];

  const lowerText = text.toLowerCase();
  return medicalKeywords.some((kw) => lowerText.includes(kw.toLowerCase()));
}
