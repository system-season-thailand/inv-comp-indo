let new_or_imported_inv_company_variable = 'new_invoice_company';





/* Code to store the data in the SupaBase */
const supabaseUrl = 'https://zrunsrimyijarswjfycw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8';
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
            .select('name')  // Only fetch the name column for faster loading
            .range(start, start + batchSize - 1); // Fetch the current 1,000-row window

        if (error) {
            console.error("❌ Error fetching data from Supabase:", error);
            break; // Abort on error – you may choose to retry depending on needs
        }

        if (!data || data.length === 0) {
            // No more rows left to fetch
            break;
        }

        // Map and push current batch into the global store (only names)
        allFetchedData.push(
            ...data.map(row => ({
                name: row.name?.trim()
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











// Function to fetch content for a specific name from Supabase
const fetchContentForName = async (name) => {
    try {
        const { data, error } = await supabase
            .from('inv_comp_indo')
            .select('inv_company_indo_content')
            .eq('name', name)
            .single();

        if (error) {
            console.error("❌ Error fetching content:", error);
            return null;
        }

        return data?.inv_company_indo_content?.trim() || null;
    } catch (error) {
        console.error("🔥 Unexpected error fetching content:", error);
        return null;
    }
};

// Function to import content for selected name
const importContentForSelectedName = async (clickedGoogleSheetDataName) => {
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");



    if (clickedGoogleSheetDataName.style.backgroundColor === 'rgb(0, 155, 0)') {

        // Get the selected name
        const selectedName = clickedGoogleSheetDataName.innerText.trim();

        // Play a sound effect
        playSoundEffect('success');

        // Fetch the content for the selected name
        const content = await fetchContentForName(selectedName);

        if (content) {
            /* Insert the imported data into the 'whole_invoice_company_section_id' */
            wholeInvoiceSection.innerHTML = content;
        } else {
            console.error("❌ Could not fetch content for:", selectedName);
            return;
        }


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

        // Get all h3 elements from the dropdown
        const allH3Elements = document.querySelectorAll('#all_google_sheet_stored_data_names_for_importing_data_div h3');

        // Extract the first 4 digits from the selected h3 element
        const selectedH3Text = clickedGoogleSheetDataName.innerText.trim();
        const first4Digits = selectedH3Text.substring(0, 4);

        // Count how many h3 elements start with the same first 4 digits
        let similarCount = 0;
        allH3Elements.forEach(h3Element => {
            const h3Text = h3Element.innerText.trim();
            if (h3Text.startsWith(first4Digits)) {
                similarCount++;
            }
        });

        /* Set the rev values in the element based on the count of similar elements */
        revNumElement.innerText = `Rev${similarCount}`;




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
