let new_or_imported_inv_company_variable = 'new_invoice_company';





/* Code to store the data in the SupaBase */
const supabaseUrl = 'https://bdisyvjhbipknpxvyctb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaXN5dmpoYmlwa25weHZ5Y3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTIyMzksImV4cCI6MjA2MjI4ODIzOX0.x3aLzQPaaMIUo4MDyPSeCPnG33LVEhtFhGvhY3SkdrQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function sendDataToSupabase() {
    /* console.log('➡️ sendDataToSupabase function started'); */

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

    /* console.log(`📅 Extracted Month: ${extractedMonth}, Year: ${extractedYear}`); */

    document.getElementById('store_google_sheet_inv_orignal_month_value').innerText = extractedMonth;
    document.getElementById('store_google_sheet_inv_orignal_year_value').innerText = extractedYear;

    const invNumber = document.getElementById("current_used_inv_number_span_id")?.innerText.trim() || "";
    const guestName = document.getElementById("current_used_guest_name_p_id").innerText.trim().replace(/[()]/g, '').trim() || "";
    const revNumber = document.getElementById("current_used_rev_number_span_id")?.innerText.trim() || "";

    const formattedName = revNumber === '' ? `${invNumber} ${guestName}` : `${invNumber}-${revNumber} ${guestName}`;
    /* console.log(`🧾 Formatted Name: ${formattedName}`); */



    /* Get the found month in the inv company data */
    const lastFoundMonthName = printLatestFullMonthName();



    /* Get the user current month na dyear to store it in the supabase for later use when deleteing data */
    const currentDate = new Date();

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

            /* Get the html elements ready to store */
            const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);


            /* console.log('🟡 Existing invoice found, updating HTML content only...'); */
            const { data, error } = await supabase
                .from('inv_comp_indo')
                .update({
                    inv_company_indo_content: htmlContent,
                    inv_company_last_found_month_name: lastFoundMonthName,
                    inv_company_user_current_date: currentUserFullDate
                })
                .eq('name', formattedName)
                .select();


            if (error) console.error("❌ Update failed:", error);
            else console.log("✅ Updated invoice content only:", data[0]);



        } else {

            /* Increase the number of the rev in case there was a value in the rev element */
            let revNumValue = document.getElementById("store_google_sheet_current_inv_company_rev_number_id");
            const currentStoredRev = parseInt(revNumValue.innerText, 10) || 0;
            revNumValue.innerText = `${currentStoredRev + 1}`;


            /* Get the html elements ready to store */
            const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);



            console.log('🟢 No existing invoice, inserting new...');
            const { data, error } = await supabase
                .from('inv_comp_indo')
                .insert([{
                    name: formattedName,
                    inv_company_indo_content: htmlContent,
                    inv_company_last_found_month_name: lastFoundMonthName,
                    inv_company_user_current_date: currentUserFullDate
                }])
                .select();

            if (error) console.error("❌ Insert failed:", error);
            else console.log("✅ Inserted new invoice:", data[0]);
        }



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

const fetchBatchFromSupabase = async () => {
    const batchSize = 1000;            // How many rows to fetch per request
    let start = 0;                     // Starting index for the current batch

    allFetchedData = [];               // Reset the global cache before refilling

    while (true) {
        const { data, error } = await supabase
            .from('inv_comp_indo')
            .select('*')
            .range(start, start + batchSize - 1); // Fetch the current 1,000-row window

        if (error) {
            console.error("❌ Error fetching data from Supabase:", error);
            break; // Abort on error – you may choose to retry depending on needs
        }

        if (!data || data.length === 0) {
            // No more rows left to fetch
            break;
        }

        // Map and push current batch into the global store
        allFetchedData.push(
            ...data.map(row => ({
                name: row.name?.trim(),
                content: row.inv_company_indo_content?.trim()
            }))
        );

        // If the batch was smaller than batchSize we reached the end
        if (data.length < batchSize) {
            break;
        }

        start += batchSize; // Move to the next batch
    }
};

const loadAllData = async () => {
    const container = document.getElementById("all_google_sheet_stored_data_names_for_importing_data_div");

    if (!container) {
        console.error("❌ Could not find #all_google_sheet_stored_data_names_for_importing_data_div");
        return;
    }

    container.innerHTML = '';
    /* console.log("🧹 Cleared container"); */

    await fetchBatchFromSupabase(); // assumes it fills allFetchedData globally

    /* console.log("📦 allFetchedData contents:", allFetchedData); */

    const allDataSet = new Set();
    const batchHTMLElements = [];

    allFetchedData.forEach(row => {
        if (row.name && !allDataSet.has(row.name)) {
            allDataSet.add(row.name);

            const h3 = document.createElement("h3");
            h3.textContent = row.name;

            h3.onclick = function () {
                /* console.log(`📥 You clicked: ${row.name}`); */
                importContentForSelectedName(this);
            };

            batchHTMLElements.push(h3);
        }
    });

    if (batchHTMLElements.length === 0) {
        console.warn("⚠️ No unique entries found to display.");
    } else {
        // Reverse the order before appending
        batchHTMLElements.reverse().forEach(el => {
            container.appendChild(el);
        });
    }

    // Optional: trigger input filter if any
    document.querySelectorAll('.search_bar_input_class').forEach(input => {
        if (input.value.trim()) {
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




    /* Call a function to allow the user to replace the logo image */
    setupLogoImagePicker();
};

// Call loadAllData to start fetching
loadAllData();
