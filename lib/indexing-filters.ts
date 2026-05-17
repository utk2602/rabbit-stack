const BINARY_EXTENSIONS =
  /\.(png|jpg|jpeg|gif|bmp|tiff|webp|ico|mp4|mp3|mov|avi|mkv|exe|dll|bin|class|jar|zip|tar|gz|rar|7z|pdf|doc|docx|xls|xlsx|ppt|pptx|woff|woff2|ttf|eot|svg|lock|node)$/i;

const SECRET_FILE_PATTERNS = [
  /^\.env(\.|$)/i,
  /(^|\/)\.npmrc$/i,
  /(^|\/)\.pypirc$/i,
  /(^|\/)\.netrc$/i,
  /(^|\/)id_rsa$/i,
  /(^|\/)id_dsa$/i,
  /(^|\/)id_ecdsa$/i,
  /(^|\/)id_ed25519$/i,
  /\.(pem|key|p12|pfx|crt|cer|jks|keystore)$/i,
  /(^|\/)(credentials|secrets?)\.(json|ya?ml|toml|ini|env)$/i,
];

const SKIPPED_DIRECTORIES = new Set([
  ".cache",
  ".git",
  ".hg",
  ".next",
  ".nuxt",
  ".output",
  ".parcel-cache",
  ".pnpm-store",
  ".serverless",
  ".svn",
  ".turbo",
  ".vercel",
  "bower_components",
  "build",
  "coverage",
  "dist",
  "generated",
  "node_modules",
  "out",
  "target",
  "vendor",
]);

const GENERATED_FILE_PATTERNS = [
  /(^|\/)package-lock\.json$/i,
  /(^|\/)pnpm-lock\.yaml$/i,
  /(^|\/)yarn\.lock$/i,
  /(^|\/)bun\.lockb$/i,
  /(^|\/)poetry\.lock$/i,
  /(^|\/)Cargo\.lock$/i,
  /(^|\/)go\.sum$/i,
  /(^|\/).*\.min\.(js|css)$/i,
  /(^|\/).*\.generated\./i,
  /(^|\/).*\.gen\./i,
];

export const MAX_INDEX_FILE_BYTES = 100_000;

function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}

export function shouldSkipRepoPath(path: string) {
  const normalized = normalizePath(path);
  const parts = normalized.split("/");

  if (parts.some((part) => SKIPPED_DIRECTORIES.has(part))) {
    return true;
  }

  if (BINARY_EXTENSIONS.test(normalized)) {
    return true;
  }

  if (SECRET_FILE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  return GENERATED_FILE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function shouldIndexRepoFile(path: string, size?: number | null) {
  if (size !== undefined && size !== null && size > MAX_INDEX_FILE_BYTES) {
    return false;
  }

  return !shouldSkipRepoPath(path);
}
