
---

# foss-license

**foss-license** is a tool designed to fetch, cache, and generate comprehensive HTML and CSV reports of Free and Open Source Software (FOSS) licenses for the dependencies in your project.

This tool helps you manage and keep track of the various licenses, avoiding redundant API calls to GitHub and preventing rate limit issues.

<p align="center">
  <img src="./media/html.png" width="450" title="HTML Report"><br/>
  <img src="./media/csv.png" width="450" alt="CSV Report">
</p>

## Features

- **License Fetching**: Automatically fetches license information for your project's dependencies using the GitHub API.
- **Caching Mechanism**: Implements a persistent, file-based cache to avoid hitting GitHub rate limits.
- **HTML Report Generation**: Generates a user-friendly HTML report of all licenses with detailed information.
- **CSV Report Generation**: Generates a CSV report for easy data manipulation and integration with other tools.
- **Error Handling**: Includes robust error handling and retry mechanisms for rate limit issues.
- **Customization**: Easily customize which packages to exclude from the license check.

### Installation

To install `foss-license` as a development dependency, you can use either npm or yarn. 

#### Using npm

To add `foss-license` as a dev dependency with npm, run:

```bash
npm install --save-dev foss-license
```

#### Using yarn

To add `foss-license` as a dev dependency with yarn, run:

```bash
yarn add --dev foss-license
```

## Usage

You can use the `foss-license` package from the command line to fetch, cache, and generate license reports. Run it using the CLI commands provided.

### CLI Commands

1. **`generate-licenses`**: This command starts the license generation process.

2. **`gfl`**: This is an alias for the `generate-licenses` command.

### Running the CLI

To use the CLI, execute one of the following commands:

```bash
npx generate-licenses <githubAuthToken>
```

or

```bash
npx gfl <githubAuthToken>
```

- `<githubAuthToken>`: Your GitHub personal access token with the necessary permissions.

### Example

Run the CLI command with your GitHub personal access token:

```bash
npx generate-licenses ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

or

```bash
npx gfl ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### Additional Information

- **GitHub Personal Access Token**:
For information on how to create a GitHub Personal Access Token, including the necessary scopes and permissions, refer to the [GitHub Personal Access Token guide](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Special thanks to:

- The developers of `license-checker-rseidelsohn` for their invaluable tool.
- The GitHub REST API for providing essential data access.
- The `stackery-plugin-vscode` repository for inspiration.
