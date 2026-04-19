import { google } from "googleapis";

const supportedPrefixes = ["image/", "video/"];

function extractFolderId(url) {
  const regexes = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ];

  for (const regex of regexes) {
    const match = url.match(regex);
    if (match?.[1]) {
      return match[1];
    }
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(url)) {
    return url;
  }

  throw new Error("Invalid Google Drive folder URL or ID.");
}

function isSupportedMedia(mimeType) {
  return supportedPrefixes.some((prefix) => mimeType.startsWith(prefix));
}

function buildDirectUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function getDriveClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing in environment variables.");
  }
  return google.drive({ version: "v3", auth: apiKey });
}

export async function fetchDriveMedia(folderUrlOrId) {
  const folderId = extractFolderId(folderUrlOrId);
  const drive = getDriveClient();

  const files = [];
  let pageToken;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        "nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, size, createdTime, modifiedTime)",
      pageSize: 200,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    pageToken = response.data.nextPageToken ?? undefined;
    const chunk = response.data.files ?? [];

    for (const file of chunk) {
      if (!file.id || !file.name || !file.mimeType || !isSupportedMedia(file.mimeType)) {
        continue;
      }

      files.push({
        fileId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink ?? "",
        directUrl: buildDirectUrl(file.id),
        thumbnailLink: file.thumbnailLink ?? "",
        sizeBytes: Number(file.size ?? 0),
        createdTime: file.createdTime ? new Date(file.createdTime) : null,
        modifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : null,
      });
    }
  } while (pageToken);

  return files;
}

export async function fetchDriveFileStream(fileId, range) {
  const drive = getDriveClient();

  const metadataResponse = await drive.files.get({
    fileId,
    fields: "id, name, mimeType",
    supportsAllDrives: true,
  });

  const mimeType = metadataResponse.data.mimeType ?? "application/octet-stream";
  if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
    throw new Error("Only image and video streaming is supported via this endpoint.");
  }

  const options = { responseType: "stream" };
  if (range) {
    options.headers = { Range: range };
  }

  const mediaResponse = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    options
  );

  return {
    mimeType,
    stream: mediaResponse.data,
    headers: mediaResponse.headers,
    status: mediaResponse.status,
  };
}
