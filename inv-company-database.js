let new_or_imported_inv_company_variable = 'new_invoice_company';



// Your Google Apps Script Web App URL
var googleSheetWebAppUrl = "https://script.google.com/macros/s/AKfycbwOTFpKDqVlQWslO-AvEYuHROAo4NsrAgQQ5mVoPcqxhGK4WaQYmtS-7d_eD5X0_RB30w/exec";

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


















/* Code to store the data in the SupaBase */
const supabaseUrl = 'https://xfymcmuozheulfffqyhv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeW1jbXVvemhldWxmZmZxeWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzMxODAsImV4cCI6MjA2MDc0OTE4MH0.BZhVN-03eLQTumyGp9LKqvV4yTuxuHaN8QA_7MC2dEo';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function sendDataToSupabase() {
    console.log('➡️ sendDataToSupabase function started');

    const fileName = document.getElementById('pdf_file_name_input_id').value;
    const parts = fileName.split(' ');
    let extractedMonth = null;
    let extractedYear = null;

    for (const part of parts) {
        let segments = part.includes('_') ? part.split('_') : part.split('-');
        if (segments.length >= 3) {
            extractedMonth = segments[1];
            extractedYear = segments[2];
        }
    }

    console.log(`📅 Extracted Month: ${extractedMonth}, Year: ${extractedYear}`);

    document.getElementById('store_google_sheet_inv_orignal_month_value').innerText = extractedMonth;
    document.getElementById('store_google_sheet_inv_orignal_year_value').innerText = extractedYear;

    const invNumber = document.getElementById("current_used_inv_number_span_id")?.innerText.trim() || "";
    const guestName = document.getElementById("current_used_guest_name_p_id").innerText.trim().replace(/[()]/g, '').trim() || "";
    const revNumber = document.getElementById("current_used_rev_number_span_id")?.innerText.trim() || "";

    const formattedName = revNumber === '' ? `${invNumber} ${guestName}` : `${invNumber}-${revNumber} ${guestName}`;
    console.log(`🧾 Formatted Name: ${formattedName}`);




    /* Increase the number of the rev in case there was a value in the rev element */
    if (document.getElementById("current_used_rev_number_span_id").innerText.includes('R')) {
        /* Set Rev in the inv number */
        let revNumValue = document.getElementById("store_google_sheet_current_inv_company_rev_number_id");
        const currentStoredRev = parseInt(revNumValue.innerText, 10) || 0;
        revNumValue.innerText = `${currentStoredRev + 1}`;
    }




    const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);


    /* Get the user current month na dyear to store it in the supabase for later use when deleteing data */
    const currentDate = new Date();

    const inv_company_created_date_options = { month: 'long', year: 'numeric' };
    const currentUserDate = currentDate.toLocaleString('en-US', inv_company_created_date_options);


    const inv_company_current_user_date_options = {
        weekday: 'long',     // Optional: "Monday", "Tuesday", etc.
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true         // Use false if you prefer 24-hour format
    };
    const currentUserFullDate = currentDate.toLocaleString('en-US', inv_company_current_user_date_options);




    try {
        const { data: existingRows, error: fetchError } = await supabase
            .from('inv_comp_indo')
            .select('name')
            .eq('name', formattedName);

        const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("❌ Error checking existing:", fetchError);
            return;
        }

        if (existing) {
            console.log('🟡 Existing invoice found, updating HTML content only...');
            const { data, error } = await supabase
                .from('inv_comp_indo')
                .update({ inv_company_indo_content: htmlContent })
                .eq('name', formattedName)
                .select(); // optional: to return the updated row

            if (error) console.error("❌ Update failed:", error);
            else console.log("✅ Updated invoice content only:", data[0]);
        } else {
            console.log('🟢 No existing invoice, inserting new...');
            const { data, error } = await supabase
                .from('inv_comp_indo')
                .insert([{
                    name: formattedName,
                    inv_company_indo_content: htmlContent,
                    inv_company_created_date: currentUserDate,
                    inv_company_user_current_date: currentUserFullDate
                }])
                .select();

            if (error) console.error("❌ Insert failed:", error);
            else console.log("✅ Inserted new invoice:", data[0]);
        }



        // Disable the button while processing
        const button = document.getElementById('check_pdf_name_button');
        button.style.pointerEvents = 'auto';
        button.innerText = 'Download';

    } catch (error) {
        console.error("🔥 Unexpected error:", error);
    }

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
        let response = await fetch(`https://script.google.com/macros/s/AKfycbwOTFpKDqVlQWslO-AvEYuHROAo4NsrAgQQ5mVoPcqxhGK4WaQYmtS-7d_eD5X0_RB30w/exec?startRow=${startRow}&numRows=${numRows}`);
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
        let revNumElement = document.querySelector("#current_used_rev_number_span_id");

        /* in 7 May 2026 delete the whole following if (I used it to avoid error in old packages with 0 values in rev number) */
        if (document.getElementById("store_google_sheet_current_inv_company_rev_number_id").innerText === '0') {
            /* Set Rev in the inv number */
            let revNumValue = document.getElementById("store_google_sheet_current_inv_company_rev_number_id");
            const currentStoredRev = parseInt(revNumValue.innerText, 10) || 0;
            revNumValue.innerText = `${currentStoredRev + 1}`;
        }


        /* Set the rev values in the element */
        revNumElement.innerText = `Rev${document.getElementById("store_google_sheet_current_inv_company_rev_number_id").innerText}`;




        /* Make the value of the 'new_or_imported_inv_company_variable' to tell the system we're editing now */
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
