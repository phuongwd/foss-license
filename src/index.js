#!/usr/bin/env node
const path = require("path");
const fs = require("fs/promises");
const checker = require("license-checker-rseidelsohn");
const { Octokit } = require("@octokit/rest");
const yargs = require("yargs");

const {
  generateLicensesHtml,
  generateLicensesCsv,
} = require("./generate-licenses");

const LICENSE_FILENAME_RE = /(licen[cs]e|copying)/i;
const REPO_RE = /github.com\/([^/]+)\/([^/]+)/;

const defaultConfig = {
  start: ".",
  production: true,
  boolean: false,
  unknown: true,
  excludePackages: [],
  excludePackagesStartingWith: "jest;@jest;@types",
};

const argv = yargs
  .default(defaultConfig)
  .option("start", {
    description: "Directory to start license checking",
    type: "string",
  })
  .option("production", {
    description: "Include production dependencies only",
    type: "boolean",
  })
  .option("boolean", {
    description: "Enable boolean license checking",
    type: "boolean",
  })
  .option("unknown", {
    description: "Include unknown licenses",
    type: "boolean",
  })
  .option("excludePackages", {
    description: "Comma-separated list of packages to exclude",
    type: "array",
  })
  .option("excludePackagesStartingWith", {
    description: "Comma-separated list of package prefixes to exclude",
    type: "string",
  })
  .command("* <githubAuthToken>", "Generate FOSS Licenses", (yargs) =>
    yargs
      .positional("githubAuthToken", {
        description: "GitHub personal access token",
        type: "string",
      })
      .strict()
  )
  .help().argv;

const { githubAuthToken: auth } = argv;
const octokit = new Octokit({
  auth,
});

// Function to sleep for a given number of milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const rootDir = process.cwd(); // Gets the root directory where the script is run
const outputDir = path.resolve(rootDir, "foss-license"); // Customize your directory name
const cacheFilePath = path.resolve(outputDir, "license-cache.json");
let cache = {};

// Ensure the output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (e) {
    console.error("Error creating output directory:", e);
  }
}

// Load cache from file if it exists
async function loadCache() {
  try {
    const data = await fs.readFile(cacheFilePath, "utf8");

    cache = JSON.parse(data);
  } catch (e) {
    console.log("No existing cache found, starting fresh");
  }
}

// Save cache to file
async function saveCache() {
  try {
    const data = JSON.stringify(cache, null, 2);

    await fs.writeFile(cacheFilePath, data, "utf8");
  } catch (e) {
    console.error("Error saving cache:", e);
  }
}

const verifyAuthToken = async (octokit) => {
  try {
    // Attempt to make a simple request to verify the token
    await octokit.request("/");
    console.log("Authentication token is valid.");
    return true; // Token is valid
  } catch (error) {
    if (error.status === 401) {
      console.error(
        "Invalid authentication token. Please check your token and try again."
      );
    } else if (error.status === 403) {
      console.error(
        "Authentication token is not authorized for this request. Ensure the token has the correct permissions."
      );
    } else if (error.status === 404) {
      console.error(
        "GitHub API endpoint not found. This may indicate an issue with the GitHub API or token."
      );
    } else {
      console.error(
        "An error occurred while verifying the authentication token:",
        error.message
      );
    }
    return false; // Token is not valid or an error occurred
  }
};

async function fetchLicenseFile(owner, repo) {
  const cacheKey = `${owner}/${repo}`;

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const normalizedRepoName = repo.replace(".git#master", "");
    const { data: files } = await octokit.rest.repos.getContent({
      owner,
      repo: normalizedRepoName,
    });

    const file = files.find((file) => LICENSE_FILENAME_RE.test(file.path));
    const licenseURL = file ? file.html_url : undefined;

    cache[cacheKey] = licenseURL;
    await saveCache(); // Save the cache after updating

    return licenseURL;
  } catch (e) {
    console.error(
      "-- Error fetching license file:",
      `${owner}/${repo}:`,
      e?.message
    );

    if (
      e.status === 403 &&
      e.response.headers["x-ratelimit-remaining"] === "0"
    ) {
      const resetTime = e.response.headers["x-ratelimit-reset"];
      const delay = resetTime * 1000 - Date.now();

      console.log(
        `Rate limit exceeded. Waiting for ${delay} ms before retrying...`
      );
      await sleep(delay);

      return fetchLicenseFile(owner, repo); // Retry after delay
    }

    cache[cacheKey] = undefined;
    await saveCache(); // Save the cache after updating

    return undefined;
  }
}

(async () => {

  console.log("argv", argv);
  await ensureOutputDir(); // Ensure output directory exists
  await loadCache(); // Load cache at the start

  // Verify the auth token
  const tokenIsValid = await verifyAuthToken(octokit);
  if (!tokenIsValid) {
    console.error("Exiting due to invalid token.");
    process.exit(1);
  }

  checker.init(
    {
      start: argv.start,
      production: argv.production,
      boolean: argv.boolean,
      unknown: argv.unknown,
      excludePackages: argv.excludePackages,
      excludePackagesStartingWith: argv.excludePackagesStartingWith,
    },
    async (err, info) => {
      if (err) {
        console.error("Error initializing license checker:", err);

        return;
      }
      const fullInfo = await Promise.allSettled(
        Object.entries(info).map(async ([module, modInfo]) => {
          let licenseURL;
          const [_, owner, repo] = modInfo.repository?.match(REPO_RE) || [];

          if (owner && repo) {
            licenseURL = await fetchLicenseFile(owner, repo);
          }

          return {
            module,
            licenseURL,
            ...modInfo,
          };
        })
      );

      const licenses = fullInfo.map((item) => item.value);

      await generateLicensesHtml(licenses, outputDir);
      await generateLicensesCsv(licenses, outputDir);
    }
  );
})();
