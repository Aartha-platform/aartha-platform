/**
 * A lightweight, zero-dependency pure TypeScript store-only ZIP generator.
 * Creates valid ZIP archives compatible with standard archive utility extraction.
 */

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    let temp = (crc ^ byte) & 0xff;
    for (let j = 0; j < 8; j++) {
      if (temp & 1) {
        temp = (temp >>> 1) ^ 0xedb88320;
      } else {
        temp = temp >>> 1;
      }
    }
    crc = (crc >>> 8) ^ temp;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFile {
  name: string;
  content: string | Uint8Array;
}

export function createSimpleZip(files: ZipFile[]): Uint8Array {
  const parts: Uint8Array[] = [];
  const localHeaders: { offset: number; size: number; name: string; crc: number; length: number }[] = [];
  let currentOffset = 0;

  for (const file of files) {
    const data = typeof file.content === 'string' ? new TextEncoder().encode(file.content) : file.content;
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = calculateCrc32(data);

    const header = new Uint8Array(30 + nameBytes.length);
    // Local file header signature (0x04034b50)
    header[0] = 0x50; header[1] = 0x4b; header[2] = 0x03; header[3] = 0x04;
    // Version needed to extract (1.0 - Store)
    header[4] = 10; header[5] = 0;
    // General purpose bit flag
    header[6] = 0; header[7] = 0;
    // Compression method (0 = Store / No compression)
    header[8] = 0; header[9] = 0;
    // Last mod file time / date (default to dummy values)
    header[10] = 0; header[11] = 0;
    header[12] = 0; header[13] = 0;
    // CRC-32
    header[14] = crc & 0xff;
    header[15] = (crc >> 8) & 0xff;
    header[16] = (crc >> 16) & 0xff;
    header[17] = (crc >> 24) & 0xff;
    // Compressed size
    header[18] = data.length & 0xff;
    header[19] = (data.length >> 8) & 0xff;
    header[20] = (data.length >> 16) & 0xff;
    header[21] = (data.length >> 24) & 0xff;
    // Uncompressed size
    header[22] = data.length & 0xff;
    header[23] = (data.length >> 8) & 0xff;
    header[24] = (data.length >> 16) & 0xff;
    header[25] = (data.length >> 24) & 0xff;
    // File name length
    header[26] = nameBytes.length & 0xff;
    header[27] = (nameBytes.length >> 8) & 0xff;
    // Extra field length
    header[28] = 0; header[29] = 0;
    // File name bytes
    header.set(nameBytes, 30);

    parts.push(header);
    parts.push(data);

    localHeaders.push({
      offset: currentOffset,
      size: header.length + data.length,
      name: file.name,
      crc,
      length: data.length,
    });

    currentOffset += header.length + data.length;
  }

  const centralDirectoryOffset = currentOffset;
  let centralDirectorySize = 0;

  for (let i = 0; i < files.length; i++) {
    const info = localHeaders[i];
    const nameBytes = new TextEncoder().encode(info.name);

    const cdHeader = new Uint8Array(46 + nameBytes.length);
    // Central directory file header signature (0x02014b50)
    cdHeader[0] = 0x50; cdHeader[1] = 0x4b; cdHeader[2] = 0x01; cdHeader[3] = 0x02;
    // Version made by (2.0)
    cdHeader[4] = 20; cdHeader[5] = 0;
    // Version needed to extract (1.0)
    cdHeader[6] = 10; cdHeader[7] = 0;
    // General purpose bit flag
    cdHeader[8] = 0; cdHeader[9] = 0;
    // Compression method (0 = Store)
    cdHeader[10] = 0; cdHeader[11] = 0;
    // Last mod file time / date
    cdHeader[12] = 0; cdHeader[13] = 0;
    cdHeader[14] = 0; cdHeader[15] = 0;
    // CRC-32
    cdHeader[16] = info.crc & 0xff;
    cdHeader[17] = (info.crc >> 8) & 0xff;
    cdHeader[18] = (info.crc >> 16) & 0xff;
    cdHeader[19] = (info.crc >> 24) & 0xff;
    // Compressed size
    cdHeader[20] = info.length & 0xff;
    cdHeader[21] = (info.length >> 8) & 0xff;
    cdHeader[22] = (info.length >> 16) & 0xff;
    cdHeader[23] = (info.length >> 24) & 0xff;
    // Uncompressed size
    cdHeader[24] = info.length & 0xff;
    cdHeader[25] = (info.length >> 8) & 0xff;
    cdHeader[26] = (info.length >> 16) & 0xff;
    cdHeader[27] = (info.length >> 24) & 0xff;
    // File name length
    cdHeader[28] = nameBytes.length & 0xff;
    cdHeader[29] = (nameBytes.length >> 8) & 0xff;
    // Extra field length
    cdHeader[30] = 0; cdHeader[31] = 0;
    // File comment length
    cdHeader[32] = 0; cdHeader[33] = 0;
    // Disk number start
    cdHeader[34] = 0; cdHeader[35] = 0;
    // Internal file attributes
    cdHeader[36] = 0; cdHeader[37] = 0;
    // External file attributes
    cdHeader[38] = 0; cdHeader[39] = 0; cdHeader[40] = 0; cdHeader[41] = 0;
    // Local header offset
    cdHeader[42] = info.offset & 0xff;
    cdHeader[43] = (info.offset >> 8) & 0xff;
    cdHeader[44] = (info.offset >> 16) & 0xff;
    cdHeader[45] = (info.offset >> 24) & 0xff;
    // File name
    cdHeader.set(nameBytes, 46);

    parts.push(cdHeader);
    centralDirectorySize += cdHeader.length;
  }

  const eocd = new Uint8Array(22);
  // End of central directory signature (0x06054b50)
  eocd[0] = 0x50; eocd[1] = 0x4b; eocd[2] = 0x05; eocd[3] = 0x06;
  // Number of this disk
  eocd[4] = 0; eocd[5] = 0;
  // Disk where central directory starts
  eocd[6] = 0; eocd[7] = 0;
  // Number of central directory records on this disk
  eocd[8] = files.length & 0xff;
  eocd[9] = (files.length >> 8) & 0xff;
  // Total number of central directory records
  eocd[10] = files.length & 0xff;
  eocd[11] = (files.length >> 8) & 0xff;
  // Size of central directory
  eocd[12] = centralDirectorySize & 0xff;
  eocd[13] = (centralDirectorySize >> 8) & 0xff;
  eocd[14] = (centralDirectorySize >> 16) & 0xff;
  eocd[15] = (centralDirectorySize >> 24) & 0xff;
  // Offset of start of central directory, relative to start of archive
  eocd[16] = centralDirectoryOffset & 0xff;
  eocd[17] = (centralDirectoryOffset >> 8) & 0xff;
  eocd[18] = (centralDirectoryOffset >> 16) & 0xff;
  eocd[19] = (centralDirectoryOffset >> 24) & 0xff;
  // Comment length
  eocd[20] = 0; eocd[21] = 0;

  parts.push(eocd);

  const totalLength = parts.reduce((acc, part) => acc + part.length, 0);
  const result = new Uint8Array(totalLength);
  let writeOffset = 0;
  for (const part of parts) {
    result.set(part, writeOffset);
    writeOffset += part.length;
  }

  return result;
}
