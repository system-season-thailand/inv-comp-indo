let existingDataStatus = 'newData'; // Variable to identify if the data will be saved as a new data in the google sheet or as an existing data




// Your Google Apps Script Web App URL
var googleSheetWebAppUrl = "https://script.google.com/macros/s/AKfycbw6e3PX3_29Ydfa07dsCvybj_4e7POA7AgK69LMcxoYwBPZbn6HtqAsCNY9dGXHEneE1Q/exec";

function sendDataToGoogleSheet() {
    var formattedName = revNumber === ''
        ? `${invNumber} ${guestName}`
        : `${invNumber} ${guestName} Rev${revNumber}`;

    var wholeSection = document.getElementById("whole_invoice_company_section_id");
    var htmlContent = wholeSection ? wholeSection.innerHTML : '';

    var cleanedHTML = cleanHTML(htmlContent);

    // Send data to Google Apps Script via POST request
    fetch(googleSheetWebAppUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: 'no-cors', // Note: This prevents getting a response from the server
        body: JSON.stringify({
            name: formattedName,
            htmlContent: cleanedHTML
        })
    })
        .then(() => {
            loadAllData();

            // Change the value of 'existingDataStatus' for editing old data mode
            existingDataStatus = 'existingData';

            /* Re-enable the p element for saving the current package data in the same saved inv comp code */
            document.getElementById('check_pdf_name_button').style.pointerEvents = 'auto';
            document.getElementById('check_pdf_name_button').style.backgroundColor = '#4CAF50';
            document.getElementById('check_pdf_name_button').innerText = 'Download';
        })
        .catch(error => console.error("Error:", error));
}


// Function to clean HTML by removing unnecessary attributes and tags
function cleanHTML(html) {
    // Remove HTML comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Trim excessive spaces
    return html.replace(/\s+/g, ' ').trim();
}





































// Global array to store all fetched data
let allFetchedData = [];

const fetchBatch = async (startRow, numRows) => {
    try {
        let response = await fetch(`https://script.google.com/macros/s/AKfycbyOsJj-siVFwGYUjSCa6EqiEnX8c37VtxO5s8w_WOHC6OEAH0w4PQ0h0bxw-t4LasDhqQ/exec?startRow=${startRow}&numRows=${numRows}`);
        let result = await response.json();

        if (!result.totalRows) {
            console.error("❌ API did not return totalRows:", result);
        }

        return result;
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        return { totalRows: 0, data: [] };
    }
};

const loadAllData = async () => {

    /* Delete all imported google sheet data */
    const container = document.getElementById("all_google_sheet_stored_data_names_for_importing_data_div");
    container.innerHTML = '';


    /* Get the whole inv company div */
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");

    
    // Fetch the total number of rows
    let initialFetch = await fetchBatch(1, 1);

    console.log("🟢 Initial Fetch Response:", initialFetch);

    let totalRows = initialFetch.totalRows || 0;

    if (totalRows === 0) {
        console.error("❌ Could not retrieve total row count.");
        return;
    }

    let batchSize = 200;
    let allDataSet = new Set(); // Store unique names
    let remainingRows = totalRows; // Start from the last row

    for (let i = 0; i < 5; i++) {
        if (remainingRows <= 1) break; // Stop if no more rows to fetch

        let numRows = Math.min(batchSize, remainingRows - 1);
        let startRow = remainingRows;
        let endRow = Math.max(1, startRow - numRows + 1);


        /* console.log(`🟡 Fetching Batch ${i + 1}: startRow = ${startRow}, numRows = ${numRows}, endRow = ${endRow}`); */


        let fetchResult = await fetchBatch(startRow, numRows);
        let data = fetchResult.data;

        if (!data.length) {
            console.warn(`⚠️ Batch ${i + 1}: No data fetched, stopping.`);
            break;
        }

        // Ensure each object is stored correctly in allFetchedData
        data.forEach(row => {
            if (row.name && row.content !== undefined) {
                allFetchedData.push({
                    name: row.name.trim(),
                    content: row.content.trim()
                });
            }
        });

        let batchHTMLElements = [];

        data.forEach(row => {
            // Log fetched data
            /* console.log(`📌 Name: "${row.name}", 📝 Content: "${row.content}"`); */


            if (row.name !== "Name" && !allDataSet.has(row.name)) {
                allDataSet.add(row.name);

                let h3 = document.createElement("h3");
                h3.textContent = row.name;
                h3.onclick = function () {
                    importContentForSelectedName(this);
                };

                // Append inside "whole_invoice_company_section_id"
                wholeInvoiceSection.appendChild(h3);

                batchHTMLElements.push(h3);
            }
        });

        // Append batch elements inside the container (backup div)
        batchHTMLElements.forEach(el => container.appendChild(el));

        remainingRows -= numRows; // Move fetch range up
    }


    // Log all data after fetching all batches
    /* console.log("✅ All fetched data stored in global variable:", allFetchedData); */
};










// Function to import content for selected name
const importContentForSelectedName = (clickedGoogleSheetDataName) => {
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");



    if (clickedGoogleSheetDataName.style.backgroundColor === 'rgb(0, 155, 0)') {

        // Find the object that matches the selected name
        let foundObject = allFetchedData.find(obj => obj.name === clickedGoogleSheetDataName.innerText.trim());

        // Play a sound effect
        playSoundEffect('success');

        console.log(`✅ Importing content for: ${clickedGoogleSheetDataName.innerText.trim()}`);

        /* Insert the imported data into the 'whole_invoice_company_section_id' */
        wholeInvoiceSection.innerHTML = foundObject.content;


        /* Hide the google sheet data */
        hideOverlay();
        /* Call a function to make all elements editable */
        makeDivContentEditable();
        // Call the function to enable the floating options functionality
        setupFloatingOptions(
            ["Including Breakfast", "Accommodation Only"],
            "breakfast_text_options_class",
            option => option
        );
        setupFloatingOptions(
            ["Jakarta", "Puncak", "Bali", "Bandung", "Lombok"],
            "location_text_options_class",
            option => option
        );
        setupFloatingOptions(
            ["1", "2", "3", "4", "5"],
            "flight_amount_text_options_class",
            option => `${option} Person`
        );
        setupFloatingOptions(
            ["CGK-DPS\nRETURN", "CGK-DPS", "DPS-CGK"],
            "flight_destination_text_options_class",
            option => option
        );
        /* Call a function to apply the transportation cities names */
        setupTransportationCitiesOptions();
        // Call the function to apply the duplicate elements functionality
        setupDuplicateOptions("duplicate_this_element_class", "invoice_company_row_div_class");




        /* Set Today's Date */
        document.getElementById("today_inv_company_date_p_id").innerText =
        `Date: ${new Date().getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()]} ${new Date().getFullYear()}`;



        /* Re-store the values to the variables again to use them later (when making pdf name) */
        guestName = document.getElementById('store_google_sheet_guest_name').innerText;
        companyName = document.getElementById('store_google_sheet_company_name').innerText;
        invNumber = document.getElementById('store_google_sheet_inv_number').innerText;



        /* Set Rev in the inv number */
        let revNumElement = document.getElementById('store_google_sheet_current_inv_company_rev_number_id');

        let revNum = parseInt(revNumElement.innerText, 10) + 1;
        document.querySelector("#proforma_invoice_date_and_number_div_id p:nth-child(3)").innerHTML = `Inv No: F${invNumber} <span class="bold_text">Rev${revNum}</span>`;
        revNumber = revNum;
        revNumElement.innerText = parseInt(revNumElement.innerText, 10) + 1;



    } else {

        // Get all <h3> elements inside the 'all_google_sheet_stored_data_names_for_importing_data_div' div
        let allGoogleSheetStoredDataNamesForImportingDataDiv = document.querySelectorAll('#all_google_sheet_stored_data_names_for_importing_data_div h3');


        console.log("🎯 Highlighting selected name:", clickedGoogleSheetDataName.innerText);

        // Loop through each <h3> element to reset their styles
        allGoogleSheetStoredDataNamesForImportingDataDiv.forEach(function (dataName) {
            dataName.style.backgroundColor = 'white';
            dataName.style.color = 'black';
        });


        // Set the background color and text color of the clicked <h3> element
        clickedGoogleSheetDataName.style.backgroundColor = 'rgb(0, 155, 0)';
        clickedGoogleSheetDataName.style.color = 'white';
    }
};

// Call loadAllData to start fetching
loadAllData();
