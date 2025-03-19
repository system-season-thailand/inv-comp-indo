const storedFetchedData = []; // Store all fetched data

const fetchBatch = async (startRow, numRows) => {
    try {
        let response = await fetch(`https://script.google.com/macros/s/AKfycbx6yZGJNuDhkd_5l34ujHLqYNVOeOwPwSo7lNqausRz0111mF0kr-FICZsDse5ZRt4C4A/exec?startRow=${startRow}&numRows=${numRows}`);
        let result = await response.json();

        if (!result.data.length) {
            console.warn("⚠️ No data returned from API:", result);
        }

        return result;
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        return { totalRows: 0, data: [] };
    }
};

const loadAllData = async () => {
    console.log("📢 Fetching all Google Sheet data...");

    let initialFetch = await fetchBatch(2, 1); // Fetch first row to get total rows
    let totalRows = initialFetch.totalRows || 0;

    if (totalRows === 0) {
        console.error("❌ Could not retrieve total row count.");
        return;
    }

    let batchSize = 200;
    for (let startRow = 2; startRow <= totalRows + 1; startRow += batchSize) { // Start from row 2
        let numRows = Math.min(batchSize, totalRows - startRow + 2);
        let fetchResult = await fetchBatch(startRow, numRows);
        
        if (fetchResult.data.length === 0) {
            console.warn(`⚠️ No more data available. Stopping at row ${startRow}.`);
            break;
        }

        storedFetchedData.push(...fetchResult.data);
    }

    console.log("✅ All data fetched successfully.");
    console.log("📌 Complete fetched data array:", storedFetchedData);

    // Append stored data to the HTML
    appendStoredData();
};

const appendStoredData = () => {
    const container = document.getElementById("all_google_sheet_stored_data_names_for_importing_data_div");
    container.innerHTML = ""; // Clear existing entries before appending new ones

    storedFetchedData.forEach((row, index) => {
        let h3 = document.createElement("h3");
        h3.textContent = row.name;
        h3.onclick = function () {
            pickThisGoogleSheetDataName(this);
        };

        container.appendChild(h3);

        // Log row details
        console.log(`Row ${index + 1}:`);
        console.log(`Name: ${row.name}`);
        console.log(`HTML: ${row.html || "No HTML content found"}`);
        console.log("-----------------------------");
    });

    console.log("📌 Fetched data successfully appended to the UI.");
};

// Start fetching data
loadAllData();


var selectedName = null;

function importContentForSelectedName() {
    console.log("📥 Importing content for selected name:", selectedName);

    let foundData = storedFetchedData.find(row => row.name === selectedName);

    if (foundData) {
        let htmlContent = foundData.html || "No HTML content found"; // Ensure fallback if empty

        console.log("✅ Found HTML Content:", htmlContent);

        // Place HTML content inside the target div
        document.getElementById("whole_invoice_company_section_id").innerHTML = htmlContent;
    } else {
        console.log("❌ Name not found in stored data.");
    }

    // Hide the overlay if needed
    hideOverlay();
}

// Start fetching and storing data
loadAllData();

// Function to pick a name from the Google Sheet data
function pickThisGoogleSheetDataName(clickedGoogleSheetDataName) {
    let allH3Elements = document.querySelectorAll('#all_google_sheet_stored_data_names_for_importing_data_div h3');

    if (clickedGoogleSheetDataName.style.color === 'white') {
        console.log("✅ Selected name:", clickedGoogleSheetDataName.innerText);

        selectedName = clickedGoogleSheetDataName.innerText;

        playSoundEffect('success');
        importContentForSelectedName();
    } else {
        // Reset all <h3> elements
        allH3Elements.forEach(dataName => {
            dataName.style.backgroundColor = 'white';
            dataName.style.color = 'black';
        });

        console.log("🎯 Highlighting selected name:", clickedGoogleSheetDataName.innerText);

        // Highlight the selected <h3>
        clickedGoogleSheetDataName.style.backgroundColor = 'rgb(0, 155, 0)';
        clickedGoogleSheetDataName.style.color = 'white';

        selectedName = clickedGoogleSheetDataName.innerText;
    }
}










div.innerHTML = row.content; // Insert the HTML content