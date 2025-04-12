let new_or_imported_inv_company_variable = 'new_invoice_company';



// Your Google Apps Script Web App URL
var googleSheetWebAppUrl = "https://script.google.com/macros/s/AKfycbyQOk1quKqE0uRPyQ0mSpX2YGdR75EqCeUcP40uMSwcQfPQqXh40UOEP5tvpeWvMLg_3w/exec";

function sendDataToGoogleSheet() {


    /* Get the Roman month name and the year of the inv company and store them in the google sheet for later use (when importing) */
    const fileName = document.getElementById('pdf_file_name_input_id').value;

    // Split the filename by spaces
    const parts = fileName.split(' ');

    // Initialize variables to hold month and year
    let extractedMonth = null;
    let extractedYear = null;

    // Loop through all parts to find ones with "_" or "-"
    for (const part of parts) {
        let segments = [];

        if (part.includes('_')) {
            segments = part.split('_');
        } else if (part.includes('-')) {
            segments = part.split('-');
        }

        // Check if we got at least 3 segments (e.g., ["123", "Month", "24"])
        if (segments.length >= 3) {
            extractedMonth = segments[1];
            extractedYear = segments[2];
        }
    }

    /* Store the values in the html code for later use (when importing) */
    document.getElementById('store_google_sheet_inv_orignal_month_value').innerText = extractedMonth;
    document.getElementById('store_google_sheet_inv_orignal_year_value').innerText = extractedYear;




    // Get values from the spans
    var invNumber = document.getElementById("current_used_inv_number_span_id")?.innerText.trim() || "";
    var guestName = document.getElementById("current_used_guest_name_p_id").innerText.trim().replace(/[()]/g, '').trim() || "";
    var revNumber = document.getElementById("current_used_rev_number_span_id")?.innerText.trim() || "";

    // Format the name
    var formattedName = revNumber === ''
        ? `${invNumber} ${guestName}`
        : `${invNumber}-${revNumber} ${guestName}`;



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
        let response = await fetch(`https://script.google.com/macros/s/AKfycbyQOk1quKqE0uRPyQ0mSpX2YGdR75EqCeUcP40uMSwcQfPQqXh40UOEP5tvpeWvMLg_3w/exec?startRow=${startRow}&numRows=${numRows}`);
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

    // Delete all previously imported Google Sheet data
    const container = document.getElementById("all_google_sheet_stored_data_names_for_importing_data_div");
    container.innerHTML = '';

    // Get the whole invoice company section
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");

    // Fetch the total number of rows
    let initialFetch = await fetchBatch(1, 1);


    let totalRows = initialFetch.totalRows || 0;

    if (totalRows === 0) {
        console.error("❌ Could not retrieve total row count.");
        return;
    }

    let batchSize = 200;
    let allDataSet = new Set(); // Store unique names
    let remainingRows = totalRows;

    for (let i = 0; i < 5; i++) {
        if (remainingRows <= 1) break;

        let numRows = Math.min(batchSize, remainingRows - 1);
        let startRow = remainingRows;
        let endRow = Math.max(1, startRow - numRows + 1);

        let fetchResult = await fetchBatch(startRow, numRows);
        let data = fetchResult.data;

        if (!data.length) {
            console.warn(`⚠️ Batch ${i + 1}: No data fetched, stopping.`);
            break;
        }

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
            if (row.name !== "Name" && !allDataSet.has(row.name)) {
                allDataSet.add(row.name);

                let h3 = document.createElement("h3");
                h3.textContent = row.name;
                h3.onclick = function () {
                    importContentForSelectedName(this);
                };

                wholeInvoiceSection.appendChild(h3);
                batchHTMLElements.push(h3);
            }
        });

        batchHTMLElements.forEach(el => container.appendChild(el));

        remainingRows -= numRows;
    }

    // 🔍 Trigger filtering based on existing search input value(s)
    let searchBarInputElements = document.querySelectorAll('.search_bar_input_class');
    searchBarInputElements.forEach(input => {
        let filter = input.value.trim().toLowerCase();
        if (filter) {
            let event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
};











// Function to import content for selected name
const importContentForSelectedName = (clickedGoogleSheetDataName) => {
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");



    if (clickedGoogleSheetDataName.style.backgroundColor === 'rgb(0, 155, 0)') {

        // Find the object that matches the selected name
        let foundObject = allFetchedData.find(obj => obj.name === clickedGoogleSheetDataName.innerText.trim());

        // Play a sound effect
        playSoundEffect('success');


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
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
        const year = today.getFullYear();

        document.getElementById("today_inv_company_date_p_id").innerText = `Date: ${day} ${month} ${year}`;






        /* Set Rev in the inv number */
        const invNumElement = document.querySelector("#current_used_inv_number_span_id");
        let revNumElement = document.querySelector("#current_used_rev_number_span_id");
        let revNumValue = document.querySelector("#store_google_sheet_current_inv_company_rev_number_id");


        if (!revNumElement) {
            // Create the element since it doesn't exist
            revNumElement = document.createElement("p");
            revNumElement.id = "current_used_rev_number_span_id";
            revNumElement.classList.add("bold_text");

            // Insert it after the inv number element
            invNumElement.parentNode.insertBefore(revNumElement, invNumElement.nextSibling);
        }


        // Increment the rev number stored in the hidden element
        if (revNumValue) {
            const currentStoredRev = parseInt(revNumValue.innerText, 10) || 0;
            revNumValue.innerText = `${currentStoredRev + 1}`;
        }

        // Set the text
        revNumElement.innerText = `Rev${revNumValue.innerText}`;




        new_or_imported_inv_company_variable = 'imported_inv_company';

    } else {

        // Get all <h3> elements inside the 'all_google_sheet_stored_data_names_for_importing_data_div' div
        let allGoogleSheetStoredDataNamesForImportingDataDiv = document.querySelectorAll('#all_google_sheet_stored_data_names_for_importing_data_div h3');


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
