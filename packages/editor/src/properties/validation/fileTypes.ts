/**
 * The file types offered in the validation panel's accept list.
 *
 * Each entry pairs a MIME type with the extensions browsers expect alongside it
 * in an `accept` attribute — the schema stores both, because the file input
 * matches on extension while the server usually checks the MIME type.
 */
export interface FileTypeOption {
  value: string;
  label: string;
  extensions?: readonly string[];
}

/** Catalogue of selectable file types, grouped by family. */
export const FILE_TYPE_OPTIONS: FileTypeOption[] = [
    // Images
    {
      value: 'image/*',
      label: 'All Images',
      extensions: ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif']
    },
    { value: 'image/jpeg', label: 'JPEG Images (.jpg, .jpeg)', extensions: ['.jpeg', '.jpg'] },
    { value: 'image/png', label: 'PNG Images (.png)', extensions: ['.png'] },
    { value: 'image/gif', label: 'GIF Images (.gif)', extensions: ['.gif'] },
    { value: 'image/webp', label: 'WebP Images (.webp)', extensions: ['.webp'] },
    { value: 'image/svg+xml', label: 'SVG Images (.svg)', extensions: ['.svg'] },
    { value: 'image/bmp', label: 'BMP Images (.bmp)', extensions: ['.bmp'] },
    { value: 'image/tiff', label: 'TIFF Images (.tiff, .tif)', extensions: ['.tiff', '.tif'] },

    // Documents
    { value: 'application/pdf', label: 'PDF Documents (.pdf)', extensions: ['.pdf'] },
    { value: 'application/msword', label: 'Word Documents (.doc)', extensions: ['.doc'] },
    {
      value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      label: 'Word Documents (.docx)',
      extensions: ['.docx']
    },
    { value: 'application/vnd.ms-excel', label: 'Excel Spreadsheets (.xls)', extensions: ['.xls'] },
    {
      value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      label: 'Excel Spreadsheets (.xlsx)',
      extensions: ['.xlsx']
    },
    { value: 'application/vnd.ms-powerpoint', label: 'PowerPoint Presentations (.ppt)', extensions: ['.ppt'] },
    {
      value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      label: 'PowerPoint Presentations (.pptx)',
      extensions: ['.pptx']
    },
    { value: 'application/rtf', label: 'Rich Text Format (.rtf)', extensions: ['.rtf'] },
    { value: 'application/vnd.oasis.opendocument.text', label: 'OpenDocument Text (.odt)', extensions: ['.odt'] },
    {
      value: 'application/vnd.oasis.opendocument.spreadsheet',
      label: 'OpenDocument Spreadsheet (.ods)',
      extensions: ['.ods']
    },
    {
      value: 'application/vnd.oasis.opendocument.presentation',
      label: 'OpenDocument Presentation (.odp)',
      extensions: ['.odp']
    },

    // Text
    { value: 'text/plain', label: 'Text Files (.txt)', extensions: ['.txt'] },
    { value: 'text/html', label: 'HTML Files (.html, .htm)', extensions: ['.html', '.htm'] },
    { value: 'text/css', label: 'CSS Files (.css)', extensions: ['.css'] },
    { value: 'text/javascript', label: 'JavaScript Files (.js)', extensions: ['.js'] },
    { value: 'text/csv', label: 'CSV Files (.csv)', extensions: ['.csv'] },
    { value: 'text/xml', label: 'XML Files (.xml)', extensions: ['.xml'] },
    { value: 'application/json', label: 'JSON Files (.json)', extensions: ['.json'] },
    { value: 'application/xml', label: 'XML Documents (.xml)', extensions: ['.xml'] },

    // Audio
    { value: 'audio/*', label: 'All Audio Files', extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'] },
    { value: 'audio/mpeg', label: 'MP3 Audio (.mp3)', extensions: ['.mp3'] },
    { value: 'audio/wav', label: 'WAV Audio (.wav)', extensions: ['.wav'] },
    { value: 'audio/ogg', label: 'OGG Audio (.ogg)', extensions: ['.ogg'] },
    { value: 'audio/mp4', label: 'MP4 Audio (.m4a)', extensions: ['.m4a'] },
    { value: 'audio/aac', label: 'AAC Audio (.aac)', extensions: ['.aac'] },
    { value: 'audio/flac', label: 'FLAC Audio (.flac)', extensions: ['.flac'] },

    // Video
    { value: 'video/*', label: 'All Video Files', extensions: ['.mp4', '.avi', '.mov', '.webm', '.flv', '.3gp'] },
    { value: 'video/mp4', label: 'MP4 Video (.mp4)', extensions: ['.mp4'] },
    { value: 'video/avi', label: 'AVI Video (.avi)', extensions: ['.avi'] },
    { value: 'video/quicktime', label: 'QuickTime Video (.mov)', extensions: ['.mov'] },
    { value: 'video/x-msvideo', label: 'AVI Video (.avi)', extensions: ['.avi'] },
    { value: 'video/webm', label: 'WebM Video (.webm)', extensions: ['.webm'] },
    { value: 'video/x-flv', label: 'Flash Video (.flv)', extensions: ['.flv'] },
    { value: 'video/3gpp', label: '3GP Video (.3gp)', extensions: ['.3gp'] },

    // Archives
    { value: 'application/zip', label: 'ZIP Archives (.zip)', extensions: ['.zip'] },
    { value: 'application/x-rar-compressed', label: 'RAR Archives (.rar)', extensions: ['.rar'] },
    { value: 'application/x-7z-compressed', label: '7-Zip Archives (.7z)', extensions: ['.7z'] },
    { value: 'application/x-tar', label: 'TAR Archives (.tar)', extensions: ['.tar'] },
    { value: 'application/gzip', label: 'GZIP Archives (.gz)', extensions: ['.gz'] },

    // Programming Files
    { value: 'application/x-python', label: 'Python Files (.py)', extensions: ['.py'] },
    { value: 'application/x-java-source', label: 'Java Files (.java)', extensions: ['.java'] },
    { value: 'application/x-csharp', label: 'C# Files (.cs)', extensions: ['.cs'] },
    { value: 'text/x-c', label: 'C Files (.c)', extensions: ['.c'] },
    { value: 'text/x-c++', label: 'C++ Files (.cpp, .cxx)', extensions: ['.cpp', '.cxx'] },
    { value: 'application/typescript', label: 'TypeScript Files (.ts)', extensions: ['.ts'] },

    // Other
    { value: 'font/woff', label: 'WOFF Fonts (.woff)', extensions: ['.woff'] },
    { value: 'font/woff2', label: 'WOFF2 Fonts (.woff2)', extensions: ['.woff2'] },
    { value: 'font/ttf', label: 'TrueType Fonts (.ttf)', extensions: ['.ttf'] },
    { value: 'font/otf', label: 'OpenType Fonts (.otf)', extensions: ['.otf'] },
    { value: 'application/x-shockwave-flash', label: 'Flash Files (.swf)', extensions: ['.swf'] }
];

const BY_MIME = new Map(FILE_TYPE_OPTIONS.map((option) => [option.value, option]));

/**
 * Builds the schema's `accept` map from a list of chosen MIME types.
 *
 * Types absent from the catalogue, or carrying no extensions, are skipped —
 * an accept entry with no extensions would reject everything.
 *
 * @param mimeTypes - MIME types the author selected
 * @returns A map of MIME type to its allowed extensions
 */
export function buildAcceptMap(mimeTypes: string[]): Record<string, readonly string[]> {
  return mimeTypes.reduce<Record<string, readonly string[]>>((accept, mimeType) => {
    const option = BY_MIME.get(mimeType);
    if (option?.extensions) accept[mimeType] = option.extensions;
    return accept;
  }, {});
}

/** Reads the selected MIME types back out of a stored accept map. */
export function selectedMimeTypes(accept: Record<string, readonly string[]> | undefined): string[] {
  return accept ? Object.keys(accept) : [];
}
