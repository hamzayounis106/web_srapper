// server.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const cors = require("cors");
const XLSX = require("xlsx");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.post("/scrape", async (req, res) => {
  const { urls } = req.body;
  const data = [];

  for (const url of urls) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const phone_number_element = $(".col-8 a strong");
      const phone_number = phone_number_element.text();
      console.log(phone_number_element.text());
      data.push({ URL: url, "Phone Number": phone_number });
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      // Handle errors by pushing a placeholder object to the data array
      data.push({ URL: url, "Phone Number": "Error" });
    }
  }

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Scraped Data");

  // Create a buffer from the workbook
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  // Convert the buffer to a base64 string
  const excelBase64 = Buffer.from(buffer).toString("base64");

  // Send the response with both the array of data and the Excel file link
  res.json({ data, excelBase64 });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
