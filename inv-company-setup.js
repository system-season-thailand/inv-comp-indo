



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













/* Function to reset the value of the textarea */
deleteTextAre = function () {
    document.getElementById("dataInput").value = '';
}



/* Function to make the first letter of each word to be capital */
const toTitleCase = (str) => {
    return str
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};




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

    // Convert current month to Roman numeral
    let currentMonth = currentDate.getMonth() + 1;
    let Roman_monthNumber = convertToRoman(currentMonth);



    /* in 6 Apr 2026 delete the following if codes (I used them to avoid error since they do't exist in old saved inv company) */
    if (!document.getElementById("store_google_sheet_inv_orignal_month_value")) {
        const monthElement = document.createElement('p');
        monthElement.innerText = 'IV';
        monthElement.id = 'store_google_sheet_inv_orignal_month_value';
        document.getElementById('whole_invoice_company_section_id').appendChild(monthElement);
    }
    if (!document.getElementById("store_google_sheet_inv_orignal_year_value")) {
        const yearElement = document.createElement('p');
        yearElement.innerText = '25';
        yearElement.id = 'store_google_sheet_inv_orignal_year_value';
        document.getElementById('whole_invoice_company_section_id').appendChild(yearElement);
    }





    // Store Roman month if not already set
    if (document.getElementById("store_google_sheet_inv_orignal_month_value").innerText === '') {
        document.getElementById("store_google_sheet_inv_orignal_month_value").innerText = Roman_monthNumber;
    }

    // Get last two digits of the current year
    let currentYear = currentDate.getFullYear();
    let lastTwoNumbersOfTheCurrentYear = currentYear % 100;

    // Store year if not already set
    if (document.getElementById("store_google_sheet_inv_orignal_year_value").innerText === '') {
        document.getElementById("store_google_sheet_inv_orignal_year_value").innerText = lastTwoNumbersOfTheCurrentYear;
    }



    if (document.getElementById("dataInput").value !== '' || new_or_imported_inv_company_variable !== 'new_invoice_company') {

        /* in 7 Apr 2026 delete the first if and keep only the else (I used it to avoid error in old packages) */
        if (!document.getElementById("current_used_company_name_p_id")) {

            // Get all necessary values
            let companyName = document.getElementById("current_used_company_name_span_id").innerText;
            let invNumber = document.getElementById("store_google_sheet_inv_number").innerText;
            let month = document.getElementById("store_google_sheet_inv_orignal_month_value").innerText;
            let year = document.getElementById("store_google_sheet_inv_orignal_year_value").innerText;
            let clientName = document.getElementById("current_used_client_name_span_id").innerText;
            let revSpan = document.getElementById("current_used_rev_number_span_id").innerText;

            // Build PDF name
            let pdfName = `Proforma INV ${companyName} ${invNumber}_${month}_${year}`;
            if (revSpan) pdfName += ` ${revSpan}`;
            pdfName += ` ${clientName}`;

            // Set file name
            document.getElementById('pdf_file_name_input_id').value = pdfName;

        } else {
            // Get all necessary values
            let companyName = document.getElementById("current_used_company_name_p_id").innerText;
            let invNumber = document.getElementById("current_used_inv_number_span_id").innerText;
            let month = document.getElementById("store_google_sheet_inv_orignal_month_value").innerText;
            let year = document.getElementById("store_google_sheet_inv_orignal_year_value").innerText;
            let clientNameRaw = document.getElementById("current_used_guest_name_p_id").innerText;
            let clientName = clientNameRaw.replace(/[()]/g, '').trim();
            let revSpan = document.getElementById("current_used_rev_number_span_id").innerText;

            // Build PDF name
            let pdfName = `Proforma INV ${companyName} ${invNumber}_${month}_${year}`;
            if (revSpan) pdfName += ` ${revSpan}`;
            pdfName += ` ${clientName}`;

            // Set file name
            document.getElementById('pdf_file_name_input_id').value = pdfName;
        }
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


    // Always format invoice number to 4 digits with leading zeros
    const formattedInvoiceNo = invoiceNo.padStart(4, "0");
    document.querySelector("#current_used_inv_number_span_id").innerText = formattedInvoiceNo;



    let agencyUpper = travelAgency.toUpperCase();
    let guestByUpper = (guestBy || "").toUpperCase();
    let finalTravelAgency;

    if (agencyUpper.includes("RAYAN") || guestByUpper.includes("RAYAN")) {
        finalTravelAgency = "MR. RAYAN";
    } else if (agencyUpper.includes("SECRET") || guestByUpper.includes("SECRET")) {
        finalTravelAgency = "SECRET";
    } else if (agencyUpper.includes("TURKI") || guestByUpper.includes("TURKI")) {
        finalTravelAgency = "MR. TURKI";
    } else if (agencyUpper.includes("TURKEY") || guestByUpper.includes("TURKEY")) {
        finalTravelAgency = "MR. TURKEY";
    } else if (agencyUpper.includes("TARIQ") || guestByUpper.includes("TARIQ")) {
        finalTravelAgency = "MR. TARIQ";
    } else if (agencyUpper.includes("SAMI") || guestByUpper.includes("SAMI")) {
        finalTravelAgency = "BOSS SAMI";
    } else if (agencyUpper.includes("SYABAB") || guestByUpper.includes("SYABAB")) {
        finalTravelAgency = "MR. RAYAN";
    } else {
        finalTravelAgency = travelAgency;
    }




    /* in 7 Apr 2026 delete the first if and keep only the else (I used it to avoid error in old packages) */
    if (!document.getElementById("current_used_company_name_p_id")) {
        document.querySelector("#invoice_company_guest_name_p_id").innerHTML = `UP TO: <span id="current_used_company_name_span_id" class="bold_text upper_case_text">${finalTravelAgency}</span> (<span id="current_used_client_name_span_id">${clientName}</span>)`;
    } else {
        document.querySelector("#current_used_company_name_p_id").innerHTML = finalTravelAgency;
        document.querySelector("#current_used_guest_name_p_id").innerHTML = `(${clientName})`;
    }


    /* Store the values in the google sheet for later refrence (when importing) */
    document.getElementById('store_google_sheet_guest_name').innerText = clientName;
    document.getElementById('store_google_sheet_company_name').innerText = travelAgency;
    document.getElementById('store_google_sheet_inv_number').innerText = invoiceNo;



    const parseDate = (dateStr) => {
        if (!dateStr || dateStr.trim() === "-") return "N/A";

        const months = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
            "Mei": "05", "Jun": "06", "Jul": "07", "Agu": "08",
            "Sep": "09", "Oct": "10", "Nov": "11", "Des": "12"
        };

        const monthReplacements = {
            "Mei": "May",
            "Agu": "Aug",
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
        let visa = null;
        let total = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const cols = trimmedLine.split('\t').map(col => col.trim());

            // Skip header row
            if (/^NO\s+HOTEL,\s+VILLA\s+\/\s+OTHER/i.test(trimmedLine)) continue;

            // Skip rows with insufficient data unless specifically handled below
            if (cols.length < 4 && !/GUEST TRANSFER|TOTAL|TICKET|TRANSPORTATION/i.test(trimmedLine)) continue;


            // Split the input text into lines and get the last non-empty row
            const lines = data.trim().split("\n").filter(line => line.trim() !== "");
            const lastLine = lines[lines.length - 1]; // Get the last row


            // Regex to find SAR, USD, or IDR followed by a number
            const match = lastLine.match(/(SAR|USD|IDR|RP)\s*([\d,]+)/i);





            if (match) {
                total = match[2].replace(/,/g, '').trim(); // Remove commas and trim
            }




            // Check if any column contains "TICKET"
            if (cols.some(col => /TICK/i.test(col))) {

                const startDate = cols[4]?.trim();
                const endDate = cols[5]?.trim();
                const quantity = cols[7]?.trim();

                flights = {
                    startDate: parseDate(startDate) || "N/A",
                    endDate: parseDate(endDate) || "N/A",
                    quantity: quantity === "-" ? "2" : quantity || "2",
                };
            }






            // Handle transportation
            else if (/TRANSPORTA/i.test(cols[1] || "")) {
                // Ensure we are using the correct columns for "CHECK IN" and "CHECK OUT"
                const startDate = cols[4]?.trim() || "N/A"; // "CHECK IN" column
                const endDate = cols[5]?.trim() || "N/A";   // "CHECK OUT" column


                transport = {
                    startDate: parseDate(startDate),
                    endDate: parseDate(endDate),
                };
            }




            /* Handle visa row */
            else if (/VISA/i.test(cols[1] || "")) {
                // Ensure we are using the correct columns for "Room Type" and "Units"
                visa = {
                    visaDyasNumber: cols[1]?.trim() || "VISA", // "Room Type" column
                    personAmount: cols[7]?.trim() || "1", // "Units" column
                };
            }





            // Handle hotel rows
            else if (cols[1]) {

                let hotel = cols[1]?.trim() || "Unknown Hotel"; // "Hotel Name" column
                let hotelLocation = cols[2]?.trim(); // "Hotel Location" column
                let roomType = toTitleCase(cols[3]?.trim() || "Unknown Room"); // "Room Type" column
                let startDateRaw = cols[4]?.trim() || "N/A"; // "CHECK IN" column
                let endDateRaw = cols[5]?.trim() || "N/A"; // "CHECK OUT" column
                let unitAmount = cols[7]?.trim() || "N/A"; // "Unit Amount" column


                // Ensure "N/A" is used for missing or invalid dates
                let startDate = parseDate(startDateRaw);
                let endDate = parseDate(endDateRaw);

                const nights = parseInt(cols[6]?.trim() || "0", 10); // "No of Nights" column

                const upperHotel = hotel.toUpperCase();

                const accommodationOnlyHotels = ["AL JUMEIRAH", "MARSEILLIA", "AL ANDALUS", "NEOM"];

                const details = accommodationOnlyHotels.some(name => upperHotel.includes(name))
                    ? "Accommodation Only"
                    : "Including Breakfast";

                hotels.push({
                    hotel,
                    hotelLocation,
                    roomType,
                    startDate,
                    endDate,
                    details,
                    nights,
                    unitAmount,
                });
            }
        }


        // Merge hotels with the same hotel name and consolidate room types
        const mergedHotels = [];
        let prevHotel = null;

        hotels.forEach((hotel) => {
            const roomTypeLower = hotel.roomType.toLowerCase();

            if (
                prevHotel &&
                prevHotel.hotel === hotel.hotel &&
                prevHotel.roomType === hotel.roomType
            ) {
                // Merge consecutive hotel entries with same name & room type
                prevHotel.nights += hotel.nights;
                prevHotel.endDate = hotel.endDate; // Update the end date
            } else if (
                prevHotel &&
                prevHotel.hotel === hotel.hotel &&
                /extra bed|decor|dinner/i.test(roomTypeLower)
            ) {
                // Append "3 Extra Bed" or "2 Decor" to the main room type
                const prefix = hotel.unitAmount && hotel.unitAmount !== "N/A" ? `${hotel.unitAmount} ` : "";
                prevHotel.roomType += ` + ${prefix}${hotel.roomType}`;
            } else if (
                prevHotel &&
                prevHotel.hotel === hotel.hotel &&
                prevHotel.endDate === hotel.endDate &&
                prevHotel.nights === hotel.nights &&
                prevHotel.checkIn === hotel.checkIn &&
                prevHotel.checkOut === hotel.checkOut
            ) {
                // Merge hotels with the same name and dates but different room types
                prevHotel.roomType += ` + ${hotel.roomType}`;
            } else {
                // Push previous hotel entry before replacing
                if (prevHotel) mergedHotels.push(prevHotel);
                prevHotel = { ...hotel };
            }
        });

        // Push the last hotel entry
        if (prevHotel) mergedHotels.push(prevHotel);


        return { hotels: mergedHotels, flights, transport, visa, total };

    };




    const lines = data.split("\n").map(line => line.trim()).filter(line => line);
    const { hotels, flights, transport, visa, total } = extractData(lines);

    document.getElementById("invoice_company_main_table_div_id").innerHTML = "";

    const mergeDates = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";

        const defaultYear = "2025"; // Set default year if missing

        const monthReplacements = {
            "Jan": "Jan",
            "Feb": "Feb",
            "Mar": "Mar",
            "Apr": "Apr",
            "Mei": "May",
            "Jun": "Jun",
            "Jul": "Jul",
            "Agu": "Aug",
            "Sep": "Sep",
            "Okt": "Oct",
            "Nov": "Nov",
            "Des": "Dec"
        };

        // Parse dates into parts
        const startParts = startDate.split(" ");
        const endParts = endDate.split(" ");

        let [startDay, startMonth, startYear] = startParts;
        let [endDay, endMonth, endYear] = endParts;

        // Replace non-English months with English ones
        startMonth = monthReplacements[startMonth] || startMonth;
        endMonth = monthReplacements[endMonth] || endMonth;

        // If year is missing, set default
        if (!startYear) startYear = defaultYear;
        if (!endYear) endYear = defaultYear;

        // Case 1: Same year and same month → "6 - 9 Jul 2025"
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

            // Check if unitAmount is more than 1 and append to roomType
            let roomTypeDisplay = item.roomType;
            if (parseInt(item.unitAmount, 10) > 1) {
                roomTypeDisplay = `(${item.unitAmount} Units) ${roomTypeDisplay}`;
            }


            const rowDiv = document.createElement("div");
            rowDiv.className = "invoice_company_row_div_class";
            rowDiv.innerHTML = `
                <div>
                    <p class="hotel_check_in_out_date_class">${mergedDate}</p>
                </div>
                <div>
                    <p class="duplicate_this_element_class">${item.hotel.toUpperCase()}</p>
                    <p class="duplicate_this_element_class">${roomTypeDisplay}</p>
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

        // If no flight out of Bangkok is found, return N/A
        if (!firstFlightDate && lastFlightDate) {
            const [day, month, year] = lastFlightDate.split(" ");
            return `${day} ${month} ${year}`;
        }
        if (!firstFlightDate) {
            return "N/A";
        }

        const [firstDay, firstMonth, firstYear] = firstFlightDate.split(" ");

        if (!lastFlightDate) {
            return `${firstDay} ${firstMonth} ${firstYear}`; // Only firstFlightDate exists
        }

        const [lastDay, lastMonth, lastYear] = lastFlightDate.split(" ");

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

    const parseIndoMonthToEnglish = (month) => {
        const monthMap = {
            "Januari": "January",
            "Februari": "February",
            "Maret": "March",
            "April": "April",
            "Mei": "May",
            "Juni": "June",
            "Juli": "July",
            "Agustus": "August",
            "September": "September",
            "Oktober": "October",
            "November": "November",
            "Desember": "December"
        };
        return monthMap[month] || month;
    };

    const formatDateRange = (start, end, fallbackYear = "2025") => {
        if (!start || !end) return "N/A";

        const [startDay, startMonthIndo] = start.split(" ");
        const [endDay, endMonthIndo] = end.split(" ");

        const startMonth = parseIndoMonthToEnglish(startMonthIndo);
        const endMonth = parseIndoMonthToEnglish(endMonthIndo || startMonthIndo);

        if (startMonth === endMonth) {
            return `${startDay} - ${endDay} ${startMonth} ${fallbackYear}`;
        } else {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${fallbackYear}`;
        }
    };

    const createFlightRow = (data) => {
        if (!data) return;

        const flightDiv = document.createElement("div");
        flightDiv.id = "flight_tickets_row_div_id";

        // Generate the flight dates dynamically
        let flightDates = getFlightDates();

        // If dynamic dates are "N/A", use startDate and endDate from `data`
        if (flightDates === "N/A" && data.startDate && data.endDate) {
            flightDates = formatDateRange(data.startDate, data.endDate);
            console.log(data.startDate, data.endDate)
        }


        let getFlightDestinationText = getFlightDestination();
        if (getFlightDestinationText === ''){
            getFlightDestinationText = '<span class="flight_destination_text_options_class red_text_color_class">N/A</span>'
        }



        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";

        rowDiv.innerHTML = `
            <div>
                <p contenteditable="true">${flightDates}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class" contenteditable="true" style="padding: 25px 0">Domestic Flight Tickets</p>
            </div>
            <div>
                <p contenteditable="true">${getFlightDestinationText}</p>
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
            : '<span class="transportation_cities_text_options_class red_text_color_class">N/A</span>'; // Set "N/A" if empty

        const defaultYear = "2025"; // Default year if missing

        // Function to ensure the date includes a year
        const parseDateWithDefaultYear = (dateString) => {
            if (!dateString) return `N/A`;

            const monthReplacements = {
                "Mei": "May",
                "Agu": "Aug",
                "Okt": "Oct",
                "Des": "Dec"
            };

            const parts = dateString.split(" ");
            let [day, month, year] = parts;
            if (!year) year = defaultYear;
            if (monthReplacements[month]) {
                month = monthReplacements[month];
            }

            return `${day} ${month} ${year}`;
        };


        // Format and merge startDate and endDate like hotels
        const formattedStartDate = parseDateWithDefaultYear(data.startDate);
        const formattedEndDate = parseDateWithDefaultYear(data.endDate);

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
        const startDateObj = new Date(`${startDay} ${startMonth} ${startYear}`);
        const endDateObj = new Date(`${endDay} ${endMonth} ${endYear}`);
        const durationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1; // Convert milliseconds to days

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";
        rowDiv.innerHTML = `
            <div>
                <p>${mergedDates}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class" style="padding: 25px 0">TRANSPORTATION + SIM CARD</p>
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






    const createVisaRow = (data) => {
        if (!data) return;

        const visaDiv = document.createElement("div");
        visaDiv.id = "visa_row_div_id";

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";

        // Add all flight dates as <p> elements
        rowDiv.innerHTML = `
            <div>
                <p contenteditable="true">${new Date().getFullYear()}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class" contenteditable="true" style="padding: 25px 0">${data.visaDyasNumber}</p>
            </div>
            <div>
                <p contenteditable="true">INDONESIA</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p class="red_text_color_class flight_amount_text_options_class" contenteditable="true">${data.personAmount} Person</p>  
            </div>`;

        visaDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(visaDiv);
    };






    const createTotalPriceRow = (total, travelAgency, guestBy) => {
        const totalDiv = document.createElement("div");
        totalDiv.id = "total_price_row_div_id";

        // Convert values to uppercase for case-insensitive comparison
        const agencyUpper = (travelAgency || "").toUpperCase();
        const guestByUpper = (guestBy || "").toUpperCase();

        // Determine the currency
        let currency = "SAR"; // Default currency
        if (agencyUpper.includes("AL EZZ")) {
            currency = "USD";
        } else if (guestByUpper.includes("RAYAN") || guestByUpper.includes("TURKI") || guestByUpper.includes("TURKEY") || guestByUpper.includes("TARIQ") || guestByUpper.includes("SECRET") || guestByUpper.includes("TURKY")) {
            currency = "IDR";
        } else if (agencyUpper.includes("RAYAN") || agencyUpper.includes("TURKI") || agencyUpper.includes("TURKEY") || agencyUpper.includes("TARIQ") || agencyUpper.includes("SECRET") || agencyUpper.includes("TURKY")) {
            currency = "IDR";
        }






        /* Get the elements to update them based on the company value */
        const top_left_inv_company_orignal_div_id = document.getElementById("top_left_inv_company_orignal_div_id");
        const top_left_inv_company_golden_div_id = document.getElementById("top_left_inv_company_golden_div_id");
        const invoice_company_golden_under_guest_name_info_div = document.getElementById("invoice_company_golden_under_guest_name_info_div");



        // Determine the orignal styling or the golden travel
        if (agencyUpper.includes("GOLDEN TRAVEL")) {

            /* in 2026 delete the following if condition (I used it tp avoid error in old inv) */
            if (top_left_inv_company_orignal_div_id) {

                top_left_inv_company_orignal_div_id.style.display = "none";
                top_left_inv_company_golden_div_id.style.display = "flex";
                invoice_company_golden_under_guest_name_info_div.style.display = "block";
            }
        } else {

            /* in 2026 delete the following if condition (I used it tp avoid error in old inv) */
            if (top_left_inv_company_orignal_div_id) {

                top_left_inv_company_orignal_div_id.style.display = "flex";
                top_left_inv_company_golden_div_id.style.display = "none";
                invoice_company_golden_under_guest_name_info_div.style.display = "none";
            }
        }






        /* Check if the company name is 'RIDA' to make it in IDR */
        if (agencyUpper === 'RIDA' || agencyUpper === 'RIDA TRAVEL') {
            currency = "IDR";

        }



        // Format total number with commas
        const formattedTotal = Number(total).toLocaleString();






        // Toggle payment details visibility based on currency
        const paymentDetails1 = document.getElementById("payment_details_1");
        const paymentDetails2 = document.getElementById("payment_details_2");
        const paymentDetails3 = document.getElementById("payment_details_3");

        if (currency === "SAR") {

            /* in 2026 delete the following if condition (I used it tp avoid error in old inv) */
            if (paymentDetails3) {

                paymentDetails1.style.display = "block";
                paymentDetails2.style.display = "none";
                paymentDetails3.style.display = "none";
            }

        } else if (currency === "USD") {

            /* in 2026 delete the following if condition (I used it tp avoid error in old inv) */
            if (paymentDetails3) {
                paymentDetails1.style.display = "none";
                paymentDetails2.style.display = "block";
                paymentDetails3.style.display = "none";
            }

        } else {

            /* in 2026 delete the following if condition (I used it tp avoid error in old inv) */
            if (paymentDetails3) {
                paymentDetails1.style.display = "none";
                paymentDetails2.style.display = "none";
                paymentDetails3.style.display = "block";
            }

        }


        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class last_invoice_company_row_div_class";
        rowDiv.innerHTML = `
            <div>
                <p class="duplicate_this_element_class">TOTAL</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p style="padding: 5px 0">${currency}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formattedTotal}</p>
            </div>`;

        totalDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(totalDiv);
    };




    createHotelRows(hotels);
    if (flights) createFlightRow(flights);
    if (transport) createTransportationRow(transport);
    if (visa) createVisaRow(visa);
    if (total) createTotalPriceRow(total, travelAgency, guestBy);



    /* Set Today's Date */
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
    const year = today.getFullYear();

    document.getElementById("today_inv_company_date_p_id").innerText = `Date: ${day} ${month} ${year}`;





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













/* Function to make all elements innerText editable */
makeDivContentEditable = function () {
    const parentDiv = document.getElementById('whole_invoice_company_section_id');
    const childElements = parentDiv.querySelectorAll("p, pre");

    childElements.forEach(element => {
        element.setAttribute('contenteditable', true);

        element.addEventListener("focus", () => {
            element.style.outline = "none";
            element.style.border = "none";
        });

        element.addEventListener("blur", () => {
            element.style.outline = "";
            element.style.border = "";
        });

        element.addEventListener("input", () => {
            if (element.classList.contains("red_text_color_class")) {
                element.style.color = "black";
            }
        });

        element.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                const br = document.createElement("br");

                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                range.deleteContents(); // remove selected text if any
                range.insertNode(br);

                // Move caret after the <br>
                range.setStartAfter(br);
                range.setEndAfter(br);
                selection.removeAllRanges();
                selection.addRange(range);
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
            if (currentElement) {
                let currentText = currentElement.innerText.trim();

                // Normalize city names for comparison (case-insensitive)
                const selectedCity = FlightDestination.trim();
                const currentCities = currentText.split(",").map(city => city.trim().toLowerCase());

                // If the city already exists, do nothing
                if (currentCities.includes(selectedCity.toLowerCase())) {
                    return;
                }

                // If current text is 'Location' or 'N/A', replace with selected city
                if (currentText === 'Location' || currentText === 'N/A') {
                    currentElement.innerText = selectedCity;
                } else {
                    currentElement.innerText = `${currentText}, ${selectedCity}`;
                }

                // Set text color to black
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
















/* Download the PDF file */
async function checkThePdfNameToDownload() {

    if (document.getElementById("current_used_guest_name_p_id").innerText !== '' && document.getElementById("current_used_inv_number_span_id")?.innerText !== '') {

        // Play a sound effect
        playSoundEffect('success');


        /* Run a function to store the data in the google sheet */
        sendDataToGoogleSheet();


        /* Run a function to store the data in the supabase */
        sendDataToSupabase();



        // Disable the button while processing
        const button = document.getElementById('check_pdf_name_button');
        button.style.pointerEvents = 'none';
        button.style.backgroundColor = 'gray';
        button.innerText = 'Great!';

        // Target all elements with the red text class
        const redTextElements = document.querySelectorAll('.red_text_color_class');

        // Store the original color and set the text color to black
        redTextElements.forEach(element => {
            element.dataset.originalColor = element.style.color; // Save original color
            element.style.color = 'black'; // Change to black for PDF
        });






        /* Hide the guest code div if there is no code value */
        if (document.getElementById("invoice_company_guest_code_value") && document.getElementById("invoice_company_guest_code_value").innerText === '') {
            document.getElementById("invoice_company_guest_code_div").style.display = 'none';
        }



        // Capture the div by ID
        const element = document.getElementById("whole_invoice_company_section_id");

        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
        }).then(canvas => {
            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            const imgWidthPx = canvas.width;
            const imgHeightPx = canvas.height;

            const pdfWidthMm = 210;      // A4 width
            const a4HeightMm = 297;      // A4 height
            const bottomPaddingMm = 10;  // Padding for tall content

            const pxPerMm = imgWidthPx / pdfWidthMm;
            const contentHeightMm = imgHeightPx / pxPerMm;

            // Add bottom padding only if height exceeds standard A4 height
            const pdfHeightMm = contentHeightMm > a4HeightMm
                ? contentHeightMm + bottomPaddingMm
                : a4HeightMm;

            const pdf = new jspdf.jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [pdfWidthMm, pdfHeightMm]
            });

            // Position image at top-left, scaled to full width
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidthMm, contentHeightMm);

            const fileName = document.getElementById('pdf_file_name_input_id').value || "invoice";
            pdf.save(`${fileName}.pdf`);
        });














        /* Show the guest code div */
        document.getElementById("invoice_company_guest_code_div").style.display = 'flex';






        // Restore original red color after download
        redTextElements.forEach(element => {
            element.style.color = element.dataset.originalColor || 'red';
        });











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
