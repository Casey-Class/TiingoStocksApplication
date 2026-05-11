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
}
