import * as pdfjsLib from 'pdfjs-dist';
import { INDIAN_BANK_PASSWORD_HINTS } from '../constants/finance.js';

// Setup pdfjs worker using standard CDN or inline path fallback
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.6.82'}/pdf.worker.min.mjs`;
  } catch {
    // GlobalWorkerOptions fallback
  }
}

/**
 * Extract raw text from a PDF file in the browser, handling passwords if encrypted.
 *
 * @param {File|Blob|ArrayBuffer} fileOrBuffer
 * @param {string} [password=''] - Optional decryption password
 * @returns {Promise<{ text: string, numPages: number, isEncrypted: boolean }>}
 */
export async function extractTextFromPdf(fileOrBuffer, password = '') {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer instanceof Blob || (typeof File !== 'undefined' && fileOrBuffer instanceof File)) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error('Invalid PDF input. Expected File, Blob, or ArrayBuffer.');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    password: password || '',
  });

  // Intercept password requests
  let isEncrypted = false;
  loadingTask.onPassword = (callback, reason) => {
    isEncrypted = true;
    if (reason === pdfjsLib.PasswordResponses.NEED_PASSWORD && !password) {
      const err = new Error('PDF is password protected');
      err.code = 'PASSWORD_REQUIRED';
      err.isEncrypted = true;
      throw err;
    } else if (reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
      const err = new Error('Incorrect PDF password');
      err.code = 'INCORRECT_PASSWORD';
      err.isEncrypted = true;
      throw err;
    }
  };

  try {
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .filter((str) => str != null)
        .join(' ');
      pageTexts.push(`--- Page ${pageNum} ---\n${pageText}`);
    }

    return {
      text: pageTexts.join('\n\n'),
      numPages,
      isEncrypted,
    };
  } catch (err) {
    if (
      err.name === 'PasswordException' ||
      err.code === 'PASSWORD_REQUIRED' ||
      err.message?.toLowerCase().includes('password')
    ) {
      const customErr = new Error(
        err.code === 'INCORRECT_PASSWORD' ? 'Incorrect password' : 'Password required'
      );
      customErr.code = err.code || 'PASSWORD_REQUIRED';
      customErr.isEncrypted = true;
      throw customErr;
    }
    throw err;
  }
}

/**
 * Returns password formatting hints for Indian banks.
 * @param {string} bankName
 * @returns {string|null}
 */
export function getBankPasswordHint(bankName = '') {
  if (!bankName) return null;
  const match = INDIAN_BANK_PASSWORD_HINTS.find((h) =>
    bankName.toLowerCase().includes(h.bank.toLowerCase().split(' ')[0])
  );
  return match ? `${match.pattern} (e.g. ${match.example})` : null;
}
