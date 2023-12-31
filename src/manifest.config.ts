import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version, name, description } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: name,
  description: description,
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  icons: {
    "16": "src/assets/icons/icon.png",
    "32": "src/assets/icons/icon.png",
    "48": "src/assets/icons/icon.png",
    "128": "src/assets/icons/icon.png",
  },
  content_scripts: [
    {
      matches: ["https://sas-concourse.ostdc.skyott.com/*"],
      js: ["src/content/index.ts"],
    },
  ],
  background: {
    service_worker: "src/background/index.ts",
  },
  action: {
    default_popup: "src/popup/popup.html",
    default_icon: {
      "16": "src/assets/icons/icon.png",
      "32": "src/assets/icons/icon.png",
      "48": "src/assets/icons/icon.png",
      "128": "src/assets/icons/icon.png",
    },
  },
  host_permissions: ["https://sas-concourse.ostdc.skyott.com/*"],
  permissions: [
    "activeTab",
    "storage",
    "scripting",
  ] as chrome.runtime.ManifestPermissions[],
}));
