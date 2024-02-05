// App.js
import React, { useState, useRef } from "react";
import axios from "axios";
import copy from "clipboard-copy";
import "./App.css";

function App() {
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [showFirstDiv, setShowFirstDiv] = useState(true);
  const audioRef = useRef(new Audio("./finishedSound.mp3"));

  const handleScrape = async () => {
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/scrape", {
        urls: urls.split("\n"),
      });

      if (Array.isArray(response.data.data)) {
        setTableData(response.data.data);
        setExcelData(response.data.excelBase64);
        // playAudio(); // Commented out - audio play
      } else {
        console.error("Error: The server response is not an array.");
      }
    } catch (error) {
      console.error("Error while scraping:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSortAndFilter = () => {
    const sortedAndFilteredData = tableData
      .filter((row) => /\d+/.test(row["Phone Number"]))
      .sort((a, b) => {
        const aNumber = parseInt(a["Phone Number"].match(/\d+/) || 0, 10);
        const bNumber = parseInt(b["Phone Number"].match(/\d+/) || 0, 10);
        return aNumber - bNumber;
      });

    setShowFirstDiv(false);
    setTableData(sortedAndFilteredData);
  };

  const handleCopyToClipboard = () => {
    const phoneNumbers = tableData.map((row) => row["Phone Number"]).join("\n");
    copy(phoneNumbers);
    // stopAudio(); // Commented out - audio stop
  };

  const handleDownload = () => {
    const byteCharacters = atob(excelData);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "output.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // stopAudio(); // Commented out - audio stop
  };

  // const playAudio = () => {
  //   audioRef.current.play(); // Commented out - audio play
  // };

  // const stopAudio = () => {
  //   audioRef.current.pause(); // Commented out - audio pause
  //   audioRef.current.currentTime = 0;
  // };

  return (
    <div className="app-container">
      <textarea
        className="input-textarea"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
      />
      <div className="buttons_div">
        <button className="action-button" onClick={handleScrape} disabled={loading}>
          {loading ? "Scraping..." : "Scrape URLs"}
        </button>
        <button className="action-button" onClick={handleDownload} disabled={!excelData}>
          Download Excel
        </button>
        <button
          className="action-button"
          onClick={handleCopyToClipboard}
          disabled={tableData.length === 0}
        >
          Copy to Clipboard
        </button>
        <button
          className="action-button"
          onClick={handleSortAndFilter}
          disabled={tableData.length === 0}
        >
          Sort and Filter
        </button>
      </div>

      {showFirstDiv && (
        <div className="result-container">
          {tableData.map((row, index) => (
            <div key={index} className="url-tr">
              <div className="url">{row.URL}</div>
              <div className="phone-number">{row["Phone Number"]}</div>
            </div>
          ))}
        </div>
      )}

      {!showFirstDiv && (
        <div className="result-container">
          {tableData.map((row, index) => (
            <div key={index}>
              <div className="phone-number">{row["Phone Number"]}</div>
            </div>
          ))}
        </div>
      )}

      {/* <button className="action-button" onClick={playAudio}>
        Play sounds
      </button> */}
    </div>
  );
}

export default App;
