



/* Page Load Header Fade Animation */
setTimeout(function () {
    document.getElementById('body').style.opacity = "1";
}, 100);






/* Code to reload the sounds to make sure there is no latency */
let clickSoundEffect = new Audio('click.ogg');
clickSoundEffect.preload = 'auto';

let successSoundEffect = new Audio('success.ogg');
successSoundEffect.preload = 'auto';

let errorSoundEffect = new Audio('error.ogg');
errorSoundEffect.preload = 'auto';

let isSoundEffectCooldown = false; // Flag to manage cooldown

function playSoundEffect(soundName) {

    if (isSoundEffectCooldown) return; // If in cooldown, do nothing

    isSoundEffectCooldown = true; // Set cooldown
    setTimeout(() => {
        isSoundEffectCooldown = false; // Reset cooldown after 150 milliseconds
    }, 150);



    let soundEffect;

    if (soundName === 'click') {
        soundEffect = clickSoundEffect;
    } else if (soundName === 'success') {
        soundEffect = successSoundEffect;
    } else if (soundName === 'error') {
        soundEffect = errorSoundEffect;
    }

    if (soundEffect) {
        soundEffect.currentTime = 0; // Ensure the audio plays from the start
        soundEffect.play();
    }
}





deleteTextAre = function () {
    document.getElementById("dataInput").value = '';
}






/* Function to convert a number to Roman numeral */
function convertToRoman(num) {
    const romanNumerals = [
        "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
    ];
    return romanNumerals[num - 1]; // Array is zero-based
}



/* Function to open choosing pdf file name box */
function openPdfDownloadBox() {
    // Check if overlay already exists
    if (document.querySelector('.black_overlay')) {
        return; // Prevent the function from running if overlay is still present
    }

    // Get the name pdf file box
    let namePdfBoxDiv = document.getElementById('name_pdf_file_div');

    // Create overlay layer
    let overlayLayer = document.createElement('div');
    overlayLayer.className = 'black_overlay';
    document.body.appendChild(overlayLayer);

    // Show overlay layer with smooth opacity transition
    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
        // Slide to the center of the screen
        namePdfBoxDiv.style.transform = 'translate(-50%, -50%)';
    }, 100);

    // Get the current date
    let currentDate = new Date();

    // Get the current month and convert it to Roman numeral
    let currentMonth = currentDate.getMonth() + 1; // Months are zero-based
    let monthNumber = convertToRoman(currentMonth);

    // Get the current year as a four-digit number
    let currentYear = new Date().getFullYear();
    // Extract the last two digits of the year
    let lastTwoNumbersOfTheCurrentYear = currentYear % 100;





    /* check if the current inv company is going through rev or no */
    if (document.getElementById("current_used_rev_number_span_id")) {
        document.getElementById('pdf_file_name_input_id').value = `Proforma INV ${document.getElementById("current_used_company_name_span_id").innerText} ${document.getElementById("current_used_inv_number_span_id").innerText}_${monthNumber}_${lastTwoNumbersOfTheCurrentYear} ${document.getElementById("current_used_rev_number_span_id").innerText} ${document.getElementById("current_used_client_name_span_id").innerText}`;
    } else {
        document.getElementById('pdf_file_name_input_id').value = `Proforma INV ${document.getElementById("current_used_company_name_span_id").innerText} ${document.getElementById("current_used_inv_number_span_id").innerText}_${monthNumber}_${lastTwoNumbersOfTheCurrentYear} ${document.getElementById("current_used_client_name_span_id").innerText}`;
    }


    /* Function to hide the name pdf file box */
    overlayLayer.onclick = function () {
        // Hide edit/delete options div
        namePdfBoxDiv.style.transform = 'translate(-50%, -100vh)';

        // Hide overlay layer with opacity transition
        overlayLayer.style.opacity = '0';

        // Remove overlay and edit/delete div from DOM after transition
        setTimeout(() => {
            document.body.removeChild(overlayLayer);

            // Now that the overlay is removed, allow the function to be triggered again
        }, 300); // Match transition duration in CSS
    };
}



















// Attach an event listener to the textarea
document.getElementById("dataInput").oninput = function () {
    processInvoiceData(`${document.getElementById("dataInput").value}`)
}




function processInvoiceData(data) {
    const rows = data.trim().split("\n");
    const guestBy = rows[0].split(":")[1].trim();
    const invoiceNo = rows[1].split(":")[1].trim().split("-").pop();
    const clientName = rows[2].split(":")[1].trim();

    // Try to extract travel agency from parentheses, fallback to guestBy if not found
    const travelAgency = guestBy.match(/\(([^)]+)\)/)?.[1] || guestBy;


    document.querySelector("#proforma_invoice_date_and_number_div_id p:nth-child(3)").innerHTML = `Inv No: F<span id="current_used_inv_number_span_id">${invoiceNo}</span>`;
    document.querySelector("#invoice_company_guest_name_p_id").innerHTML = `UP TO: <span id="current_used_company_name_span_id" class="bold_text upper_case_text">${travelAgency}</span></span> (<span id="current_used_client_name_span_id">${clientName}</span>)`;



    /* Store the values in the google sheet for later refrence (when importing) */
    document.getElementById('store_google_sheet_guest_name').innerText = clientName;
    document.getElementById('store_google_sheet_company_name').innerText = travelAgency;
    document.getElementById('store_google_sheet_inv_number').innerText = invoiceNo;



    const parseDate = (dateStr) => {
        if (!dateStr || dateStr.trim() === "-") return "N/A";

        const months = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
            "Mei": "05", "Jun": "06", "Jul": "07", "Aug": "08",
            "Sep": "09", "Oct": "10", "Nov": "11", "Des": "12"
        };

        const monthReplacements = {
            "Mei": "May",
            "Des": "Dec"
        };

        const parts = dateStr.split(/[-/]/);
        if (parts.length === 2) {
            const [day, month] = parts;
            const year = "2025";

            // Get the month's name from its number, or use the original month
            let monthName = Object.keys(months).find(key => months[key] === month) || month;

            // Replace "Mei" with "May" and "Des" with "Dec" if necessary
            monthName = monthReplacements[monthName] || monthName;

            return `${day} ${monthName} ${year}`;
        }

        return dateStr;
    };


    const extractData = (lines) => {
        const hotels = [];
        let flights = null;
        let transport = null;
        let total = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const cols = trimmedLine.split(/\t+/).map(col => col.trim());

            // Skip header row
            if (/^NO\s+HOTEL,\s+VILLA\s+\/\s+OTHER/i.test(trimmedLine)) continue;

            // Skip rows with insufficient data unless specifically handled below
            if (cols.length < 4 && !/GUEST TRANSFER|TICKET|TRANSPORTATION/i.test(trimmedLine)) continue;


            // Split the input text into lines and get the last non-empty row
            const lines = data.trim().split("\n").filter(line => line.trim() !== "");
            const lastLine = lines[lines.length - 1]; // Get the last row


            // Regex to find SAR, USD, or IDR followed by a number
            const match = lastLine.match(/(SAR|USD|IDR)\s*([\d,]+)/i);





            if (match) {
                total = match[2].replace(/,/g, '').trim(); // Remove commas and trim
            }




            // Check if any column contains "TICKET"
            if (cols.some(col => /TICKET/i.test(col))) {

                const startDate = cols[3]?.trim();
                const endDate = cols[4]?.trim();
                const quantity = cols[6]?.trim();

                flights = {
                    startDate: parseDate(startDate) || "N/A",
                    endDate: parseDate(endDate) || "N/A",
                    quantity: quantity === "-" ? "2" : quantity || "2",
                };
            }






            // Handle transportation
            else if (/TRANSPORTATION/i.test(cols[1] || "")) {
                // Ensure we are using the correct columns for "CHECK IN" and "CHECK OUT"
                const startDate = cols[4]?.trim() || "N/A"; // "CHECK IN" column
                const endDate = cols[5]?.trim() || "N/A";   // "CHECK OUT" column


                transport = {
                    startDate: parseDate(startDate),
                    endDate: parseDate(endDate),
                };
            }


            // Handle hotel rows
            else if (cols[1]) {

                let hotel = cols[1]?.trim() || "Unknown Hotel"; // "Hotel Name" column
                let hotelLocation = cols[2]?.trim(); // "Hotel Location" column
                let roomType = cols[3]?.trim(); // "Room Type" column
                let startDateRaw = cols[4]?.trim(); // "CHECK IN" column
                let endDateRaw = cols[5]?.trim(); // "CHECK OUT" column

                // Handle cases where "Room Type" is missing or misaligned
                if (!roomType || roomType.match(/^\d{1,2}-[A-Za-z]{3}$/)) {
                    roomType = "Unknown Room";
                    startDateRaw = cols[3]?.trim(); // Shift "CHECK IN" to cols[3]
                    endDateRaw = cols[4]?.trim();   // Shift "CHECK OUT" to cols[4]
                }

                // Ensure "N/A" is used for missing or invalid dates
                let startDate = (!startDateRaw || startDateRaw === "0" || startDateRaw === "1") ? "000" : parseDate(startDateRaw);
                let endDate = (!endDateRaw || endDateRaw === "0" || endDateRaw === "1") ? "000" : parseDate(endDateRaw);

                const nights = parseInt(cols[6]?.trim() || "0", 10); // "No of Nights" column

                hotels.push({
                    hotel,
                    hotelLocation,
                    roomType,
                    startDate,
                    endDate,
                    details: (hotel.toUpperCase() === "AL JUMEIRAH RESORT & VILLAS" ||
                        hotel.toUpperCase() === "MARSEILLIA HILLS PUNCAK" ||
                        hotel.toUpperCase() === "AL ANDALUS RESORT PUNCAK" || hotel.toUpperCase() === "NEOM VILLA")
                        ? "Accommodation Only"
                        : "Including Breakfast",
                    nights
                });
            }
        }


        // Merge hotels with the same hotel and room type
        const mergedHotels = [];
        const hotelMap = new Map();

        hotels.forEach((hotel) => {
            const key = `${hotel.hotel}-${hotel.roomType}`;
            if (hotelMap.has(key)) {
                const existing = hotelMap.get(key);
                existing.nights += hotel.nights;
                existing.endDate = hotel.endDate; // Update end date
            } else {
                hotelMap.set(key, { ...hotel });
            }
        });

        hotelMap.forEach((value) => mergedHotels.push(value));

        return { hotels: mergedHotels, flights, transport, total };
    };




    const lines = data.split("\n").map(line => line.trim()).filter(line => line);
    const { hotels, flights, transport, total } = extractData(lines);

    document.getElementById("invoice_company_main_table_div_id").innerHTML = "";

    const mergeDates = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";

        // Parse dates into parts
        const startParts = startDate.split(" ");
        const endParts = endDate.split(" ");

        const [startDay, startMonth, startYear] = startParts;
        const [endDay, endMonth, endYear] = endParts;

        // Case 1: Same year and same month → "6-9 Jul 2025"
        if (startYear === endYear && startMonth === endMonth) {
            return `${startDay} - ${endDay} ${startMonth} ${startYear}`;
        }

        // Case 2: Same year but different months → "28 Apr - 2 May 2025"
        if (startYear === endYear) {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
        }

        // Case 3: Different years → "27 Dec 2025 - 3 Jan 2026"
        return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    };

    const createHotelRows = (data) => {
        const allHotelsDiv = document.createElement("div");
        allHotelsDiv.id = "all_hotels_rows_div_id";

        data.forEach(item => {
            const mergedDate = mergeDates(item.startDate, item.endDate);

            const rowDiv = document.createElement("div");
            rowDiv.className = "invoice_company_row_div_class";
            rowDiv.innerHTML = `
                <div>
                    <p class="hotel_check_in_out_date_class">${mergedDate}</p>
                </div>
                <div>
                    <p class="duplicate_this_element_class">${item.hotel.toUpperCase()}</p>
                    <p class="duplicate_this_element_class">${item.roomType}</p>
                    <p class="breakfast_text_options_class">${item.details}</p>
                </div>
                <div>
                    <p class="hotel_location_value_class location_text_options_class">${item.hotelLocation}</p>
                </div>
                <div style="border-right: 0.5px solid black;">
                    <p>${item.nights} Night${item.nights > 1 ? "s" : ""}</p>
                </div>`;

            allHotelsDiv.appendChild(rowDiv);
        });

        document.getElementById("invoice_company_main_table_div_id").appendChild(allHotelsDiv);
    };




    const getFlightDates = () => {
        const hotelRows = document.querySelectorAll(".invoice_company_row_div_class");

        let locations = [];
        let checkOutDates = [];

        hotelRows.forEach(row => {
            const location = row.querySelector(".hotel_location_value_class")?.innerText.trim();
            const dateRange = row.querySelector(".hotel_check_in_out_date_class")?.innerText.trim();

            if (location && dateRange) {
                const [_, checkOutDate] = dateRange.split(" - "); // Extract checkout date

                // Normalize specific cities to "Jakarta"
                const normalizedLocation = ["Puncak", "Bandung", "Lombok"].includes(location) ? "Jakarta" : location;

                locations.push(normalizedLocation);
                checkOutDates.push(checkOutDate);
            }
        });

        let firstFlightDate = null;
        let lastFlightDate = null;

        for (let i = 0; i < locations.length - 1; i++) {
            if (locations[i] === "Jakarta" && locations[i + 1] !== "Jakarta") {
                firstFlightDate = checkOutDates[i]; // Leaving Jakarta
            }
            if (locations[i] !== "Jakarta" && locations[i + 1] === "Jakarta") {
                lastFlightDate = checkOutDates[i]; // Returning to Jakarta
            }
        }

        if (!firstFlightDate || !lastFlightDate) {
            return "N/A"; // No valid flight period
        }

        // Extract parts of the dates
        const [firstDay, firstMonth, firstYear] = firstFlightDate.split(" ");
        const [lastDay, lastMonth, lastYear] = lastFlightDate.split(" ");

        // Format the output based on the year and month condition
        if (firstYear === lastYear) {
            if (firstMonth === lastMonth) {
                return `${firstDay} - ${lastDay} ${firstMonth} ${firstYear}`; // Same month
            }
            return `${firstDay} ${firstMonth} - ${lastDay} ${lastMonth} ${firstYear}`; // Different month
        } else {
            return `${firstDay} ${firstMonth} ${firstYear} - ${lastDay} ${lastMonth} ${lastYear}`; // Different year
        }
    };



    const getFlightDestination = () => {
        const hotelLocationElements = document.querySelectorAll(".hotel_location_value_class");
        let locations = Array.from(hotelLocationElements).map(el => el.innerText.trim());

        // Normalize specific cities to "Jakarta"
        locations = locations.map(loc =>
            ["Puncak", "Bandung", "Lombok"].includes(loc) ? "Jakarta" : loc
        );

        // Convert city names to airport codes
        const cityToAirport = {
            "Jakarta": "CGK",
            "Bali": "DPS"
        };

        let airportCodes = locations.map(loc => cityToAirport[loc] || loc);

        // Construct the flight destination string for every transition
        let flightDestinations = [];
        for (let i = 0; i < airportCodes.length - 1; i++) {
            if (airportCodes[i] !== airportCodes[i + 1]) {
                flightDestinations.push(`${airportCodes[i]}-${airportCodes[i + 1]}`);
            }
        }

        return flightDestinations.join("<br>");
    };

    const createFlightRow = (data) => {
        if (!data) return;

        const flightDiv = document.createElement("div");
        flightDiv.id = "flight_tickets_row_div_id";

        // Generate the flight dates dynamically
        const flightDates = getFlightDates();

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";

        // Add all flight dates as <p> elements
        rowDiv.innerHTML = `
            <div>
                <p contenteditable="true">${flightDates}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class" contenteditable="true">Domestic Flight Tickets</p>
            </div>
            <div>
                <p class="flight_destination_text_options_class" contenteditable="true">${getFlightDestination()}</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p class="red_text_color_class flight_amount_text_options_class" contenteditable="true">${data.quantity} Person</p>  
            </div>`;

        flightDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(flightDiv);
    };






    const createTransportationRow = (data) => {
        if (!data) return;

        const transportDiv = document.createElement("div");
        transportDiv.id = "transportation_row_div_id";

        // Get all hotel locations from elements with the class "hotel_location_value_class"
        const allHotelLocations = Array.from(document.querySelectorAll(".hotel_location_value_class"))
            .map(p => p.innerText.trim()) // Extract text and trim spaces
            .filter(text => text !== ""); // Remove empty values

        // Use Set to remove duplicates, then convert back to an array
        const uniqueHotelLocations = [...new Set(allHotelLocations)];

        // Join locations with a comma
        const allHotelLocationsSeparatedByComma = uniqueHotelLocations.length > 0
            ? uniqueHotelLocations.join(", ")
            : '<span class="red_text_color_class">N/A</span>'; // Set "N/A" if empty

        // Format and merge startDate and endDate like hotels
        const formattedStartDate = parseDate(data.startDate);
        const formattedEndDate = parseDate(data.endDate);

        // Extract day, month, and year
        const [startDay, startMonth, startYear] = formattedStartDate.split(" ");
        const [endDay, endMonth, endYear] = formattedEndDate.split(" ");

        let mergedDates;

        if (startYear === endYear) {
            if (startMonth === endMonth) {
                // Same month: "10 - 15 May 2025"
                mergedDates = `${startDay} - ${endDay} ${startMonth} ${startYear}`;
            } else {
                // Same year, different months: "28 Apr - 3 May 2025"
                mergedDates = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
            }
        } else {
            // Different years: "27 Dec 2025 - 3 Jan 2026"
            mergedDates = `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
        }

        // Calculate the number of days between the dates
        const startDateObj = new Date(data.startDate);
        const endDateObj = new Date(data.endDate);
        const durationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1; // Convert milliseconds to days

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";
        rowDiv.innerHTML = `
            <div>
                <p>${mergedDates}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class">TRANSPORTATION + SIM CARD</p>
            </div>
            <div>
                <p class="transportation_cities_text_options_class">${allHotelLocationsSeparatedByComma}</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p>${durationDays} Days</p> 
            </div>`;

        transportDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(transportDiv);
    };




    const createTotalPriceRow = (total, travelAgency, guestBy) => {
        const totalDiv = document.createElement("div");
        totalDiv.id = "total_price_row_div_id";

        // Convert values to uppercase for case-insensitive comparison
        const agencyUpper = (travelAgency || "").toUpperCase();
        const guestUpper = (guestBy || "").toUpperCase();

        // Determine the currency
        let currency = "SAR"; // Default currency
        if (agencyUpper === "AL EZZ") {
            currency = "USD";
        } else if (guestUpper === "RAYAN" || guestUpper === "TURKI") {
            currency = "IDR";
        }

        // Format total number with commas
        const formattedTotal = Number(total).toLocaleString();

        // Update logo based on currency
        const logoElement = document.getElementById("inv_comp_logo");
        if (logoElement) {
            logoElement.src = currency === "IDR" ? "fanadiq-logo.jpg" : "season-logo.jpg";
        }

        // Update background and text color based on currency
        const mainDiv = document.getElementById("main_inv_company_row_id");
        if (mainDiv) {
            if (currency === "IDR") {
                mainDiv.style.backgroundColor = "rgb(216, 228, 188)";
                mainDiv.style.color = "black";
            } else {
                mainDiv.style.backgroundColor = "rgb(6, 53, 62)";
                mainDiv.style.color = "white";
            }
        }

        // Toggle payment details visibility based on currency
        const paymentDetails1 = document.getElementById("payment_details_1");
        const paymentDetails2 = document.getElementById("payment_details_2");

        if (paymentDetails1 && paymentDetails2) {
            if (currency === "IDR") {
                paymentDetails1.style.display = "none";
                paymentDetails2.style.display = "block";
            } else {
                paymentDetails1.style.display = "block";
                paymentDetails2.style.display = "none";
            }
        }

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class last_invoice_company_row_div_class";
        rowDiv.innerHTML = `
            <div>
                <p class="duplicate_this_element_class">Total</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p>${currency}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formattedTotal}</p>
            </div>`;

        totalDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(totalDiv);
    };




    createHotelRows(hotels);
    if (flights) createFlightRow(flights);
    if (transport) createTransportationRow(transport);
    if (total) createTotalPriceRow(total, travelAgency, guestBy);



    document.getElementById("today_inv_company_date_p_id").innerText =
        `Date: ${new Date().getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()]} ${new Date().getFullYear()}`;




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
}













makeDivContentEditable = function () {
    const parentDiv = document.getElementById('whole_invoice_company_section_id');

    // Make all child elements inside the div contenteditable
    const childElements = parentDiv.querySelectorAll("p, pre"); // Target both <p> and <pre> elements


    childElements.forEach(element => {
        // Make the element contenteditable
        element.setAttribute('contenteditable', true);

        // Add a focus event listener to each element
        element.addEventListener("focus", () => {
            // Remove the default outline and borders when focused
            element.style.outline = "none";
            element.style.border = "none";
        });

        // Optional: Add a blur event to restore styles if needed
        element.addEventListener("blur", () => {
            // Restore the border and outline after losing focus
            element.style.outline = "";
            element.style.border = "";
        });

        // Add an input event listener to detect text changes
        element.addEventListener("input", () => {

            // Check if the element has the "red_text_color_class"
            if (element.classList.contains("red_text_color_class")) {
                // Change the text color to black
                element.style.color = "black";  // Change to black
            }
        });
    });
};






















let activeMenu = null; // Keeps track of the currently visible menu

/* Floating Options */
function setupFloatingOptions(options, targetClass, formatOption) {
    const colors = ["darkorange", "darkred", "darkblue", "darkgreen", "gray"]; // Array of dark background colors

    // Create the floating options menu
    const optionsMenu = document.createElement("div");
    optionsMenu.style.position = "absolute";
    optionsMenu.style.display = "none"; // Hide by default
    optionsMenu.style.zIndex = "1000";
    optionsMenu.style.background = "#fff";
    optionsMenu.style.border = "1px solid #ccc";
    optionsMenu.style.padding = "10px";
    optionsMenu.style.borderRadius = "5px";
    optionsMenu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    optionsMenu.style.flexDirection = "row"; // Explicitly set row layout
    optionsMenu.style.gap = "10px"; // Add spacing between options
    optionsMenu.style.alignItems = "center"; // Align items vertically in the center

    // Add options to the menu
    options.forEach((optionText, index) => {
        const option = document.createElement("div");
        option.innerText = optionText;
        option.style.cursor = "pointer";
        option.style.padding = "8px 15px"; // Adjusted padding for readability
        option.style.textAlign = "center";
        option.style.fontSize = "1rem"; // Smaller font for compactness
        option.style.color = "#ffffff"; // White text color
        option.style.backgroundColor = colors[index % colors.length]; // Rotate through dark background colors
        option.style.borderRadius = "3px"; // Slight rounding for aesthetics
        option.style.whiteSpace = "nowrap"; // Prevent text from wrapping
        option.style.display = "inline-flex"; // Ensure options behave as inline-flex
        option.style.margin = "0 5px"; // Add small margin on left and right

        // Add click event to set the innerText of the clicked element
        option.addEventListener("click", () => {
            currentElement.innerText = formatOption(optionText);
            currentElement.style.color = "black";
            optionsMenu.style.display = "none"; // Hide the menu
            activeMenu = null; // Clear the active menu
        });

        optionsMenu.appendChild(option);
    });

    // Remove last border
    if (optionsMenu.lastChild) {
        optionsMenu.lastChild.style.borderBottom = "none";
    }

    // Append the menu to the document
    document.body.appendChild(optionsMenu);

    let currentElement = null;

    // Add event listener to all elements with the target class
    document.querySelectorAll(`.${targetClass}`).forEach(element => {
        element.addEventListener("click", (e) => {
            // Hide the currently active menu if it exists
            if (activeMenu) activeMenu.style.display = "none";

            // Store the clicked element
            currentElement = e.target;

            // Position the menu near the clicked element
            const rect = currentElement.getBoundingClientRect();
            optionsMenu.style.left = `${rect.left}px`;
            optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;

            // Show the menu
            optionsMenu.style.display = "block";
            activeMenu = optionsMenu; // Set the active menu

            // Prevent event propagation to avoid hiding the menu immediately
            e.stopPropagation();
        });
    });

    // Hide the menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && !e.target.classList.contains(targetClass)) {
            optionsMenu.style.display = "none";
            activeMenu = null; // Clear the active menu
        }
    });
}














/* Transpotation Cities Options */
function setupTransportationCitiesOptions() {
    // Define the flight amount options
    const FlightDestinations = ["Jakarta", "Puncak", "Bali", "Bandung", "Lombok"];
    const colors = ["darkorange", "darkred", "darkblue", "darkgreen", "gray"]; // Array of dark background colors

    // Create the floating options menu
    const optionsMenu = document.createElement("div");
    optionsMenu.style.position = "absolute";
    optionsMenu.style.display = "none"; // Hide by default
    optionsMenu.style.zIndex = "1000";
    optionsMenu.style.background = "#fff";
    optionsMenu.style.border = "1px solid #ccc";
    optionsMenu.style.padding = "10px";
    optionsMenu.style.borderRadius = "5px";
    optionsMenu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    optionsMenu.style.flexDirection = "row"; // Explicitly set row layout
    optionsMenu.style.gap = "10px"; // Add spacing between options
    optionsMenu.style.alignItems = "center"; // Align items vertically in the center



    // Add flight amount options to the menu
    FlightDestinations.forEach((FlightDestination, index) => {
        const option = document.createElement("div");
        option.innerText = FlightDestination;
        option.style.cursor = "pointer";
        option.style.padding = "8px 15px"; // Adjusted padding for readability
        option.style.textAlign = "center";
        option.style.fontSize = "1rem"; // Smaller font for compactness
        option.style.color = "#ffffff"; // White text color
        option.style.backgroundColor = colors[index % colors.length]; // Rotate through dark background colors
        option.style.borderRadius = "3px"; // Slight rounding for aesthetics
        option.style.whiteSpace = "nowrap"; // Prevent text from wrapping
        option.style.display = "inline-flex"; // Ensure options behave as inline-flex
        option.style.margin = "0 5px"; // Add small margin on left and right


        // Add click event to set the innerText of the clicked p element
        option.addEventListener("click", () => {
            if (currentElement.innerText === 'Location') {

                currentElement.innerText = '';
                currentElement.innerText = FlightDestination;
                currentElement.style.color = 'black';

            } else {

                currentElement.innerText = `${currentElement.innerText}, ${FlightDestination}`;
                currentElement.style.color = 'black';
            }

        });

        optionsMenu.appendChild(option);
    });

    // Remove last border
    if (optionsMenu.lastChild) {
        optionsMenu.lastChild.style.borderBottom = "none";
    }

    // Append the menu to the document
    document.body.appendChild(optionsMenu);

    let currentElement = null;

    // Add event listener to all p elements with the target class
    document.querySelectorAll(".transportation_cities_text_options_class").forEach(p => {
        p.addEventListener("click", (e) => {
            // Store the clicked element
            currentElement = e.target;

            // Position the menu near the clicked element
            const rect = currentElement.getBoundingClientRect();
            optionsMenu.style.left = `${rect.left}px`;
            optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;

            // Show the menu
            optionsMenu.style.display = "block";
        });
    });

    // Hide the menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && !e.target.classList.contains("transportation_cities_text_options_class")) {
            optionsMenu.style.display = "none";
        }
    });
}





















/* Function to duplicate the clicked row */
function setupDuplicateOptions(targetClass, parentClass) {
    // Create the floating options menu
    const optionsMenu = document.createElement("div");
    optionsMenu.style.position = "absolute";
    optionsMenu.style.display = "none"; // Hide by default
    optionsMenu.style.zIndex = "1000";
    optionsMenu.style.background = "#fff";
    optionsMenu.style.border = "1px solid #ccc";
    optionsMenu.style.padding = "10px";
    optionsMenu.style.borderRadius = "5px";
    optionsMenu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    optionsMenu.style.flexDirection = "row"; // Explicitly set row layout
    optionsMenu.style.gap = "10px"; // Add spacing between options
    optionsMenu.style.alignItems = "center"; // Align items vertically in the center

    const copyUpOption = document.createElement("div");
    copyUpOption.innerText = "Copy Up";
    copyUpOption.style.cursor = "pointer";
    copyUpOption.style.padding = "8px 10px";
    copyUpOption.style.textAlign = "center";
    copyUpOption.style.borderBottom = "1px solid #eee";
    copyUpOption.style.fontSize = "1.2rem";
    copyUpOption.style.color = "#ffffff";
    copyUpOption.style.backgroundColor = "darkblue";
    copyUpOption.style.borderRadius = "3px";
    copyUpOption.style.whiteSpace = "nowrap"; // Prevent text from wrapping
    copyUpOption.style.display = "inline-flex"; // Ensure options behave as inline-flex
    copyUpOption.style.margin = "0 5px"; // Add small margin on left and right

    const copyDownOption = document.createElement("div");
    copyDownOption.innerText = "Copy Down";
    copyDownOption.style.cursor = "pointer";
    copyDownOption.style.padding = "8px 10px";
    copyDownOption.style.textAlign = "center";
    copyDownOption.style.fontSize = "1.2rem";
    copyDownOption.style.color = "#ffffff";
    copyDownOption.style.backgroundColor = "darkgreen";
    copyDownOption.style.borderRadius = "3px";
    copyDownOption.style.whiteSpace = "nowrap"; // Prevent text from wrapping
    copyDownOption.style.display = "inline-flex"; // Ensure options behave as inline-flex
    copyDownOption.style.margin = "0 5px"; // Add small margin on left and right

    const deleteDivOption = document.createElement("div");
    deleteDivOption.innerText = "Delete";
    deleteDivOption.style.cursor = "pointer";
    deleteDivOption.style.padding = "8px 10px";
    deleteDivOption.style.textAlign = "center";
    deleteDivOption.style.fontSize = "1.2rem";
    deleteDivOption.style.color = "#ffffff";
    deleteDivOption.style.backgroundColor = "darkred"; // Use red for delete
    deleteDivOption.style.borderRadius = "3px";
    deleteDivOption.style.whiteSpace = "nowrap";
    deleteDivOption.style.display = "inline-flex";
    deleteDivOption.style.margin = "0 5px";

    optionsMenu.appendChild(copyUpOption);
    optionsMenu.appendChild(copyDownOption);
    optionsMenu.appendChild(deleteDivOption);
    document.body.appendChild(optionsMenu);

    let currentElement = null;

    document.querySelectorAll(`.${targetClass}`).forEach(element => {
        element.addEventListener("click", (e) => {
            if (activeMenu) activeMenu.style.display = "none";

            currentElement = e.target;

            const rect = currentElement.getBoundingClientRect();
            optionsMenu.style.left = `${rect.left}px`;
            optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;

            optionsMenu.style.display = "block";
            activeMenu = optionsMenu;

            e.stopPropagation();
        });
    });

    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && !e.target.classList.contains(targetClass)) {
            optionsMenu.style.display = "none";
            activeMenu = null;
        }
    });

    copyUpOption.addEventListener("click", () => {
        if (currentElement) {
            const parentDiv = currentElement.closest(`.${parentClass}`);
            if (parentDiv) {
                const clone = parentDiv.cloneNode(true);
                parentDiv.parentNode.insertBefore(clone, parentDiv);
            }
            optionsMenu.style.display = "none";
            activeMenu = null;

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

        }
    });

    copyDownOption.addEventListener("click", () => {
        if (currentElement) {
            const parentDiv = currentElement.closest(`.${parentClass}`);
            if (parentDiv) {
                const clone = parentDiv.cloneNode(true);
                parentDiv.parentNode.insertBefore(clone, parentDiv.nextSibling);
            }
            optionsMenu.style.display = "none";
            activeMenu = null;

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

        }
    });




    deleteDivOption.addEventListener("click", () => {
        if (currentElement) {
            const parentDiv = currentElement.closest(`.${parentClass}`); // Find the parent div
            if (parentDiv) {
                parentDiv.remove(); // Remove it from the DOM

                optionsMenu.style.display = "none";
                activeMenu = null;


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
            }
        }
    });
}





















/* Download the PDF file */
async function checkThePdfNameToDownload() {

    if (document.getElementById("current_used_client_name_span_id").innerText !== '' && document.getElementById("current_used_inv_number_span_id")?.innerText !== '') {

        // Play a sound effect
        playSoundEffect('success');

        // Disable the button while processing
        const button = document.getElementById('check_pdf_name_button');
        button.style.pointerEvents = 'none';
        button.style.backgroundColor = 'gray';
        button.innerText = 'Yaay!';

        // Target all elements with the red text class
        const redTextElements = document.querySelectorAll('.red_text_color_class');

        // Store the original color and set the text color to black
        redTextElements.forEach(element => {
            element.dataset.originalColor = element.style.color; // Save original color
            element.style.color = 'black'; // Change to black for PDF
        });

        // Capture the div by ID
        const element = document.getElementById("whole_invoice_company_section_id");

        // Convert the div content to an image
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        // Convert canvas to a compressed image
        const imgData = canvas.toDataURL("image/jpeg", 0.7);

        // Create a jsPDF instance
        const pdf = new jspdf.jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // Get PDF dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const padding = 5;
        const availableWidth = pdfWidth - padding * 1;
        const availableHeight = pdfHeight - padding * 1;

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        let scaledWidth, scaledHeight;

        if (imgWidth / imgHeight > availableWidth / availableHeight) {
            scaledWidth = availableWidth;
            scaledHeight = (imgHeight * availableWidth) / imgWidth;
        } else {
            scaledHeight = availableHeight;
            scaledWidth = (imgWidth * availableHeight) / imgHeight;
        }

        // Calculate centered position
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;

        // Add the image to the PDF
        pdf.addImage(imgData, "JPEG", x, y, scaledWidth, scaledHeight);

        // Trigger PDF download
        pdf.save(`${document.getElementById('pdf_file_name_input_id').value}.pdf`);

        // Restore original red color after download
        redTextElements.forEach(element => {
            element.style.color = element.dataset.originalColor || 'red';
        });






        /* Run a function to store the data in the google sheet */
        sendDataToGoogleSheet()

    } else {
        // Play a sound effect
        playSoundEffect('error');

        const button = document.getElementById('check_pdf_name_button');

        // Change background to red gradient
        button.style.background = 'rgb(125, 46, 46)';

        setTimeout(() => {
            // Change background back to green gradient after 1 second
            button.style.background = '#4CAF50';
        }, 500);

    }
}















// Praper the overlay layer variable
let overlayLayer = null;

// Function to show the overlay
function showOverlay(clickedInputDropdownIdName) {

    // Disable scrolling
    document.documentElement.style.overflow = 'hidden';


    let clickedInputDropdown = document.getElementById(clickedInputDropdownIdName);

    // Store the reference to the last clicked input field
    lastClickedClintMovementsCityInput = document.getElementById(event.target.id);
    clickedInputDropdown.classList.add('show'); // Show the clicked input dropdown
    clickedInputDropdown.style.transition = 'transform 0.2s ease-in-out'; // Ensure transform transition is smooth

    overlayLayer = document.createElement('div'); // Create a new overlay element
    overlayLayer.className = 'black_overlay'; // Set the class name for styling
    overlayLayer.onclick = hideOverlay; // Set the click event listener to hide the overlay when clicked outside
    document.body.appendChild(overlayLayer); // Append overlay to the document body

    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
    }, 50);
}

// Function to hide the overlay and any visible dropdown
function hideOverlay() {

    // Re-enable scrolling
    document.documentElement.style.overflow = 'auto';


    // Check if any dropdown with the class name 'searchable_names_dropdown_class' is visible and hide it
    let visibleDropdown_1 = document.querySelector('.searchable_names_dropdown_class.show');
    if (visibleDropdown_1) {
        visibleDropdown_1.classList.remove('show'); // Remove 'show' class to hide dropdown
    }


    // Reset all 'searchable_names_dropdown_class' elements back to their default styling
    let dropdownDivElements = document.querySelectorAll('.searchable_names_dropdown_class');
    dropdownDivElements.forEach(dropdown => {
        dropdown.style.maxHeight = ''; // Reset maxHeight to default
        dropdown.style.minHeight = ''; // Reset minHeight to default
        dropdown.style.transition = ''; // Reset transition to default
    });

    // Hide the overlay if it exists
    if (overlayLayer) {
        overlayLayer.style.opacity = '0'; // Set opacity to 0 for smooth disappearance

        setTimeout(() => {
            if (overlayLayer) {
                document.body.removeChild(overlayLayer); // Remove overlay from DOM
                overlayLayer = null; // Reset overlay variable
            }
        }, 200); // Assuming 200ms is the duration of your opacity transition
    }
}











// Select all elements with the class 'search_bar_input_class'
let searchBarInputElements = document.querySelectorAll('.search_bar_input_class');

// Add event listeners to each search bar input element
searchBarInputElements.forEach(input => {

    // Add a click event listener to the input element
    input.addEventListener('click', () => {
        // Find the closest parent element with the class 'searchable_names_dropdown_class'
        let dropdownDiv = input.closest('.searchable_names_dropdown_class');

        // Set a smooth transition for the height property
        dropdownDiv.style.transition = 'height 0.1s ease-in-out';

        // Set the height of the dropdown div to 70vh when the search bar is clicked
        dropdownDiv.style.maxHeight = '70vh';
        dropdownDiv.style.minHeight = '70vh';
    });

    // Add an input event listener to the input element
    input.addEventListener('input', () => {
        // Get the trimmed and lowercased value of the input element
        let filter = input.value.trim().toLowerCase();

        // Split the input value into words for better matching
        let filterWords = filter.split(/\s+/); // Split by any whitespace

        // Find the closest parent element with the class 'searchable_names_dropdown_class'
        let dropdownDiv = input.closest('.searchable_names_dropdown_class');

        // Select all <h3> elements within the same dropdown div
        let options = dropdownDiv.querySelectorAll('h3');

        // Function to count occurrences of a word in a string
        let countOccurrences = (text, word) => {
            return text.split(word).length - 1;
        };

        // Initialize a counter for the number of visible options
        let visibleCount = 0;

        // Loop through each option in the dropdown
        options.forEach(option => {
            // Get the trimmed and lowercased text content of the option
            let optionText = option.textContent.trim().toLowerCase();

            // Check if all filter words are present in the option text with the same or more occurrences
            let matches = filterWords.every(word => {
                // Count occurrences of the word in the input and in the option text
                let inputWordCount = countOccurrences(filter, word);
                let optionWordCount = countOccurrences(optionText, word);

                // The word in the option text must appear at least as many times as in the input
                return optionWordCount >= inputWordCount;
            });

            // If the filter is empty and less than 6 options are visible, show the option
            if (filter === '' && visibleCount < 6) {
                option.style.display = 'block'; // Display the option
                visibleCount++; // Increment the visible options count
            }
            // If the option text includes all words from the filter with the correct occurrence count, show the option
            else if (matches) {
                option.style.display = 'block'; // Display the option
            }
            // Otherwise, hide the option
            else {
                option.style.display = 'none'; // Hide the option
            }
        });
    });
});
