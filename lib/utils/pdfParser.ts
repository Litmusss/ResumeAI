import pdf from "pdf-parse";

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert the File object to an ArrayBuffer and then to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const data = await pdf(buffer);

    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF.");
  }
}
