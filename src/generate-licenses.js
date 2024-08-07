const fs = require("fs");
const path = require("path");

// Function to get current date and time in YYYY-MM-DD_HH-MM-SS format
function getCurrentDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2); // Months are zero-indexed
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}${month}${day}`;
}

const currentDateTime = getCurrentDateTime();
const outputHtmlFile = `foss-licenses-${currentDateTime}.html`;
const outputCsvFile = `foss-licenses-${currentDateTime}.csv`;

// Create the HTML header
const htmlHeader = (timestamp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FOSS Licenses</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        header {
            background: #333;
            color: #fff;
            padding: 1em 0;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 0.5em;
            text-align: left;
        }
        th {
            position: sticky;
            top: 0;
            background-color: #f4f4f4;
        }
    </style>
</head>
<body>
    <header>
        <h1>FOSS Licenses</h1>
        <p>Generated on: ${timestamp}</p>
    </header>
    <section>
        <table>
            <tr>
                <th>Component Name</th>
                <th>License Title</th>
                <th>License URL</th>
                <th>Copyrights</th>
                <th>Public Repository</th>
            </tr>`;

// Create the HTML footer
const htmlFooter = `
        </table>
    </section>
</body>
</html>`;

// Read the JSON file
function generateLicensesHtml(licenses, outputDir) {
  const timestamp = new Date().toLocaleString();
  let htmlContent = htmlHeader(timestamp);

  // Iterate over each license and create table rows
  for (let i = 0; i < licenses.length; i++) {
    const item = licenses[i];

    if (item.repository) {
      const licenseUrl = item.licenseURL ? item.licenseURL : "";

      htmlContent += `
            <tr>
                <td>${item.module}</td>
                <td>${item.licenses}</td>
                <td><a href="${licenseUrl || "#"}">${licenseUrl || ""}</a></td>
                <td>${item.publisher || "N/A"}</td>
                <td><a href="${item.repository || "#"}">${
        item.repository || "N/A"
      }</a></td>
            </tr>`;
    }
  }

  // Add the footer to the HTML content
  htmlContent += htmlFooter;

  const outputFile = path.join(outputDir, outputHtmlFile);
  // Write the HTML content to the output file
  fs.writeFile(outputFile, htmlContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing the output file:", err);

      return;
    }
    console.log("HTML file generated successfully:", outputFile);
  });
}

// Generate CSV file
async function generateLicensesCsv(licenses, outputDir) {
  const csvHeader =
    "Component Name,License Title,License URL,Copyrights,Public Repository\n";
  let csvContent = csvHeader;

  // Iterate over each license and create CSV rows
  for (let i = 0; i < licenses.length; i++) {
    const item = licenses[i];

    if (item.repository) {
      const licenseUrl = item.licenseURL ? item.licenseURL : "";
      const row = `"${item.module}","${item.licenses}","${licenseUrl}","${
        item.publisher || "N/A"
      }","${item.repository || "N/A"}"\n`;

      csvContent += row;
    }
  }

  const outputFile = path.join(outputDir, outputCsvFile);
  // Write the CSV content to the output file
  fs.writeFile(outputFile, csvContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing the output file:", err);

      return;
    }
    console.log("CSV file generated successfully:", outputFile);
  });
}

module.exports = {
  generateLicensesHtml,
  generateLicensesCsv,
};
