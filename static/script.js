document.getElementById("search-btn").addEventListener("click", search);
document.getElementById("clear-btn").addEventListener("click", clearContent);
document.getElementById("clear-btn").addEventListener("click", () => {
    document.getElementById("symbol").value = "";
    })
document.getElementById("tab-outlook").addEventListener("click", switchTabs);
document.getElementById("tab-summary").addEventListener("click", switchTabs);
document.getElementById("tab-history").addEventListener("click", switchTabs);





function switchTabs(event) {
    // find which button was clicked
    const clicked = event.target;
    const buttonId = clicked.id;
    const contentId = buttonId.replace("tab-", ""); // derive matching content ID

    // hide all tab content
    const allContent = document.querySelectorAll(".tab-content");
    allContent.forEach(div => div.classList.add("hidden"));

    // reveal active content
    const activeContent = document.getElementById(contentId);
    activeContent.classList.remove("hidden");

    const allButtons = document.querySelectorAll("#tabs button");
    allButtons.forEach(btn => btn.classList.remove("active"));
    clicked.classList.add("active");
}

function clearContent() {
    // hard code hiding content
    document.getElementById("tabs").classList.add("hidden");
    document.querySelectorAll("#tabs button").forEach(btn => btn.classList.add("hidden"));
    document.querySelectorAll(".tab-content").forEach(div => div.classList.add("hidden"));
    document.getElementById("error").classList.add("hidden");

    // clear active tab styling
    document.querySelectorAll(".active").forEach(btn => btn.classList.remove("active"));

    // clear tables
    document.querySelectorAll("tbody").forEach(tbody => tbody.innerHTML = "");
}

function validate(event) {
    // validate user input
    alert('Please fill out this field');
}

function showError() {
    document.getElementById("error").innerHTML = "<p>Error: No record has been found, please enter a valid symbol.</p>";
    document.getElementById("error").classList.remove("hidden");
}

function search() {
    // backend connection
    const symbol = document.getElementById("symbol").value.trim();
    if (!symbol) {
            alert('Please fill out this field');
            return;
    }

    fetch(`/search?ticker=${symbol}`)
        .then(response => {
            if (!response.ok) {
                showError()
                throw new Error("Ticker not found");
            }
            return response.json()
        })
        .then(parsed => {
            clearContent()

            generateOutlookTable(parsed);
            generateSummaryTable(parsed);

            document.getElementById("tabs").classList.remove("hidden");
            document.getElementById("outlook").classList.remove("hidden");

        })
        .catch(err => console.error(err));
}

function generateOutlookTable(parsed) {
    const tbody = document.querySelector("#outlook tbody");
    tbody.innerHTML = ""; // clear previous table

    const addRow = (label, value) => {
        tbody.innerHTML += `
            <tr>
                <th>${label}</th>
                <td>${value ?? ""}</td>
            </tr>
        `;
    };

    addRow("Company Name", parsed.company.name);
    addRow("Ticker", parsed.company.ticker);
    addRow("Exchange", parsed.company.exchangeCode);
    addRow("Start Date", parsed.company.startDate);
    addRow("Description", `<span class="description-cell">${parsed.company.description ?? ""}</span>`);

}


function generateSummaryTable(parsed) {
    const tbody = document.querySelector("#summary tbody");
    tbody.innerHTML = ""; // clear previous table

    const addRow = (label, value) => {
        tbody.innerHTML += `
            <tr>
                <th>${label}</th>
                <td>${value ?? ""}</td>
            </tr>
        `;
    };

    addRow("Stock Ticker Symbol", parsed.stock.ticker);
    addRow("Trading Day", parsed.stock.timestamp);
    addRow("Previous Closing Price", parsed.stock.prevClose);
    addRow("Opening Price", parsed.stock.open);
    addRow("High Price", parsed.stock.high);
    addRow("Low Price", parsed.stock.low);

    let lastPrice = parsed.stock.last ?? parsed.stock.tngoLast ?? 0;
    addRow("Last Price", lastPrice.toFixed(2));

    let change = lastPrice - parsed.stock.prevClose;
    let changeDisplay = change.toFixed(2);
    if (change > 0) {
        changeDisplay += " <img src=\"/static/GreenArrowUP.png\">";
    } else if (change < 0) {
        changeDisplay += " <img src=\"/static/RedArrowDown.png\">";
    }
    addRow("Change", changeDisplay);

    let changePercent = (change / parsed.stock.prevClose) * 100;
    let changePercentDisplay = changePercent.toFixed(2) + "%";
    if (change > 0) {
            changePercentDisplay += " <img src=\"/static/GreenArrowUP.png\">";
        } else if (change < 0) {
            changePercentDisplay += " <img src=\"/static/RedArrowDown.png\">";
    }
    addRow("Change Percent", changePercentDisplay);

    addRow("Number of Shares Traded", parsed.stock.volume);
}

function generateHistoryTable() {
}


