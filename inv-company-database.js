let new_or_imported_inv_company_variable = 'new_invoice_company';


async function sendDataToSupabase() {
    /* console.log('➡️ sendDataToSupabase function started'); */

    const fileName = document.getElementById('pdf_file_name_input_id').value;
    const parts = fileName.split(' ');
    let extractedMonth = null;
    let extractedYear = null;

    for (const part of parts) {
        let segments = part.includes('_') ? part.split('_') : part.split('-');
        if (segments.length >= 3) {
            extractedMonth = segments[segments.length - 2];
            extractedYear = segments[segments.length - 1];
        }
    }

    console.log(`📅 Extracted Month: ${extractedMonth}, Year: ${extractedYear}`);

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

// Find the first dated invoice row in the main table. Each row type stores its
// date in its first <p>, so this works without the optional hotel-row container.
const getInvoiceYearDetailsFromContent = (content) => {
    const documentFragment = new DOMParser().parseFromString(content || '', 'text/html');
    const allRowsContainer = documentFragment.querySelector('#invoice_company_main_table_div_id');
    const invoiceRows = [...(allRowsContainer?.querySelectorAll('.invoice_company_row_div_class') || [])];
    const rowDetails = invoiceRows.map((row, index) => ({
        rowNumber: index + 1,
        paragraphTexts: [...row.querySelectorAll('p')].map(paragraph => paragraph.textContent.replace(/\s+/g, ' ').trim()),
        html: row.outerHTML
    }));

    for (const rowDetail of rowDetails) {
        const rowDate = rowDetail.paragraphTexts[0] || '';
        const yearTokens = rowDate.match(/\b(?:19|20)\d{2}\b/g) || [];
        const year = yearTokens[0];

        if (year) {
            return { firstDatedRow: rowDetail.rowNumber, rowDate, yearTokens, year, rowDetails };
        }
    }

    console.warn('Could not determine invoice year from an invoice row in #invoice_company_main_table_div_id');
    return { firstDatedRow: null, rowDate: '', yearTokens: [], year: '', rowDetails };
};

const getInvoiceYearFromContent = (content) => getInvoiceYearDetailsFromContent(content).year;

const getInvoiceNumberFromName = (name) => name.trim().match(/^\d+/)?.[0] || name.trim().split(/[\s-]/)[0];

const fetchBatchFromSupabase = async () => {
    const batchSize = 1000;            // How many rows to fetch per request
    let start = 0;                     // Starting index for the current batch

    allFetchedData = [];               // Reset the global cache before refilling

    while (true) {
        const { data, error } = await supabase
            .from('inv_comp_indo')
            .select('name, inv_company_indo_content')
            .range(start, start + batchSize - 1); // Fetch the current 1,000-row window

        if (error) {
            console.error("❌ Error fetching data from Supabase:", error);
            break; // Abort on error – you may choose to retry depending on needs
        }

        if (!data || data.length === 0) {
            // No more rows left to fetch
            break;
        }

        // Keep the content so the list label can use the first invoice-row date's year.
        allFetchedData.push(
            ...data.map(row => ({
                name: row.name?.trim(),
                content: row.inv_company_indo_content
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
            const invoiceYear = getInvoiceYearFromContent(row.content);
            const invoiceNumber = getInvoiceNumberFromName(row.name);
            h3.textContent = invoiceYear ? `${invoiceYear.slice(-2)}__${row.name}` : row.name;
            h3.dataset.databaseName = row.name;
            h3.dataset.invoiceKey = invoiceYear ? `${invoiceYear}__${invoiceNumber}` : invoiceNumber;

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
        const selectedName = clickedGoogleSheetDataName.dataset.databaseName || clickedGoogleSheetDataName.innerText.trim();

        // Play a sound effect
        playSoundEffect('success');

        // Fetch the content for the selected name
        const content = await fetchContentForName(selectedName);

        if (content) {
            const invoiceYearDetails = getInvoiceYearDetailsFromContent(content);
            console.groupCollapsed(`[Invoice year debug] ${selectedName}`);
            console.log({
                selectedDatabaseName: selectedName,
                displayedLabel: clickedGoogleSheetDataName.innerText.trim(),
                revisionInvoiceKey: clickedGoogleSheetDataName.dataset.invoiceKey || '',
                firstDatedRow: invoiceYearDetails.firstDatedRow,
                dateTextUsed: invoiceYearDetails.rowDate,
                detectedYearTokens: invoiceYearDetails.yearTokens,
                detectedInvoiceYear: invoiceYearDetails.year
            });
            console.table(invoiceYearDetails.rowDetails.map(({ rowNumber, paragraphTexts }) => ({
                rowNumber,
                firstParagraph: paragraphTexts[0] || '',
                allParagraphs: paragraphTexts.join(' | ')
            })));
            console.log('Complete dated invoice row HTML:', invoiceYearDetails.rowDetails[invoiceYearDetails.firstDatedRow - 1]?.html || '(no dated row found)');
            console.groupEnd();

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

        // Match revisions by the invoice year and invoice number together.
        const selectedInvoiceKey = clickedGoogleSheetDataName.dataset.invoiceKey;

        // Count revisions only for the same year + invoice-number combination.
        let similarCount = 0;
        allH3Elements.forEach(h3Element => {
            if (h3Element.dataset.invoiceKey === selectedInvoiceKey) {
                similarCount++;
            }
        });

        /* Set the rev values in the element based on the count of similar elements */
        revNumElement.innerText = `Rev${similarCount}`;




        /* Make the value of the 'new_or_imported_inv_company_variable' to tell the system we're editing now */
        new_or_imported_inv_company_variable = 'imported_inv_company';


        /* Find Out What is The Value of Moneth & Year of The Imported INV Comp */
        /* console.log(document.getElementById('store_google_sheet_inv_orignal_month_value').innerText);
        console.log(document.getElementById('store_google_sheet_inv_orignal_year_value').innerText); */


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
