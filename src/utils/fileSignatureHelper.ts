// src/utils/fileSignatureHelper.ts

export type DetectedFormat = 'PNG' | 'JPEG' | 'PDF' | 'WEBP';

/**
 * Inspects a File's binary header (magic bytes) client-side.
 * Detects whether the file is valid PNG, JPEG, PDF, or WebP.
 * Automatically corrects conflicting file extensions if the internal content is valid.
 */
export async function inspectAndNormalizeFile(
    file: File,
    allowedFormats: DetectedFormat[] = ['PNG', 'JPEG', 'PDF', 'WEBP']
): Promise<{ file: File; detectedFormat: DetectedFormat | null; error: string | null }> {
    try {
        const slice = file.slice(0, 16);
        const buffer = await slice.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        let detected: DetectedFormat | null = null;

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (
            bytes.length >= 8 &&
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47 &&
            bytes[4] === 0x0d &&
            bytes[5] === 0x0a &&
            bytes[6] === 0x1a &&
            bytes[7] === 0x0a
        ) {
            detected = 'PNG';
        }
        // JPEG: FF D8 FF
        else if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            detected = 'JPEG';
        }
        // PDF: %PDF (25 50 44 46)
        else if (
            bytes.length >= 4 &&
            bytes[0] === 0x25 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x44 &&
            bytes[3] === 0x46
        ) {
            detected = 'PDF';
        }
        // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
        else if (bytes.length >= 12) {
            let riff = '';
            for (let i = 0; i < 4; i++) riff += String.fromCharCode(bytes[i]);
            let webp = '';
            for (let i = 8; i < 12; i++) webp += String.fromCharCode(bytes[i]);
            if (riff === 'RIFF' && webp === 'WEBP') {
                detected = 'WEBP';
            }
        }

        if (!detected) {
            return {
                file,
                detectedFormat: null,
                error: `The file "${file.name}" is corrupted or has an unsupported format. Please upload a valid JPG, PNG, WebP or PDF.`,
            };
        }

        if (!allowedFormats.includes(detected)) {
            return {
                file,
                detectedFormat: detected,
                error: `Format "${detected}" is not allowed for this document. Permitted formats: ${allowedFormats.join(', ')}.`,
            };
        }

        // Align extension with detected format
        const validExtensions: Record<DetectedFormat, string[]> = {
            PNG: ['.png'],
            JPEG: ['.jpg', '.jpeg'],
            PDF: ['.pdf'],
            WEBP: ['.webp'],
        };

        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const currentExt = extMatch ? extMatch[0].toLowerCase() : '';

        if (!validExtensions[detected].includes(currentExt)) {
            // Extension conflicts with binary format (e.g. named .jpeg but is PNG)
            // Normalize filename extension so it passes backend signature verification
            const targetExt = detected === 'JPEG' ? '.jpg' : `.${detected.toLowerCase()}`;
            const baseName = file.name.replace(/\.[0-9a-z]+$/i, '') || 'document';
            const normalizedName = `${baseName}${targetExt}`;

            const normalizedFile = new File([file], normalizedName, {
                type: detected === 'PDF' ? 'application/pdf' : `image/${detected.toLowerCase()}`,
                lastModified: file.lastModified,
            });

            console.warn(`[File Signature Normalized] Renamed "${file.name}" to "${normalizedName}" to match detected format ${detected}.`);
            return { file: normalizedFile, detectedFormat: detected, error: null };
        }

        return { file, detectedFormat: detected, error: null };
    } catch (err: any) {
        console.error('Failed to inspect file magic bytes:', err);
        return { file, detectedFormat: null, error: 'Could not read file binary headers.' };
    }
}
