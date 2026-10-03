//for filter-button
const API_URL = "http://localhost:8081/api/tickets";
let formType = "lost";
const form = document.querySelector("#form");

let type = "all";  

const buttons = document.querySelectorAll(".filter-buttons button");

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    type = button.dataset.filter;                  

    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", "false"); 
    });

    button.setAttribute("aria-pressed", "true"); 

    render();                                  
  });
});

//for report lost item/register found item
const newButtons = document.querySelectorAll("[data-new]");
const formDialog = document.querySelector("#formDlg");
const formTitle = document.querySelector("#fTitle");
const cancelButton = document.querySelector("#fCancel");

newButtons.forEach(function (button) {
  button.addEventListener("click", function () {

    form.reset();

    formType = button.dataset.new;

if (formType === "lost") {
  formTitle.textContent = "Report lost item";
  document.querySelector("#fDateL").textContent = "Date lost";
  document.querySelector("#fPlaceL").textContent = "Where was it lost?";
  document.querySelector("#fPersonL").textContent = "Owner name";
} else {
  formTitle.textContent = "Register found item";
  document.querySelector("#fDateL").textContent = "Date found";
  document.querySelector("#fPlaceL").textContent = "Where was it found?";
  document.querySelector("#fPersonL").textContent = "Finder name";
}

  formDialog.showModal();
  });
});

cancelButton.addEventListener("click", function () {
  formDialog.close();
});

//category
const defaultCategories = ["Bags & wallets", "Keys", "Phones & electronics", "Clothing", "Documents & cards", "Other"];


function fillSelect(select, names) {
  names.forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

function loadCategories() {
  fillSelect(document.querySelector("#fCat"), defaultCategories);   // form dropdown
  fillSelect(document.querySelector("#cat"), defaultCategories);    // filter dropdown
}

loadCategories();

let items = [];

// Converts a ticket from the backend into the shape render() expects
function fromApi(ticket) {
  return {
    id: ticket.id,
    type: ticket.type.toLowerCase(),
    name: ticket.itemName,
    category: ticket.category,
    place: ticket.location,
    date: ticket.eventDate,
    image: null,
    description: ticket.description,
    status: ticket.status.toLowerCase(),
    createdAt: ticket.createdAt
  };
}

// GET: load all tickets from the backend, then draw the cards
async function loadItems() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Server error");
    const tickets = await response.json();
    items = tickets.map(fromApi);
  } catch (error) {
    console.error("Could not load tickets:", error);
    items = [];
  }
  render();
}

function getVisibleItems() {
  const query = document.querySelector("#q").value.trim().toLowerCase();
  const category = document.querySelector("#cat").value;
  const sort = document.querySelector("#sort").value;

  const result = items.filter(function (item) {
    // 1. type buttons (note: "returned" is a status, not a type)
    let matchesType;
    if (type === "all") {
      matchesType = true;
    } else if (type === "returned") {
      matchesType = item.status === "returned";
    } else {
      matchesType = item.type === type;
    }

    // 2. category dropdown ("" means all categories)
    const matchesCategory = category === "" || item.category === category;

    // 3. search box
    const text = (item.name + " " + item.category + " " + item.place + " " + (item.description || "")).toLowerCase();
    const matchesSearch = text.includes(query);

    return matchesType && matchesCategory && matchesSearch;
  });

  // 4. sorting
  result.sort(function (a, b) {
    if (sort === "old") return a.createdAt.localeCompare(b.createdAt);
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.createdAt.localeCompare(a.createdAt);   // "new" (default)
  });

  return result;
}

function updateStats() {
  document.querySelector("#s1").textContent =
    items.filter(function (i) { return i.type === "lost" && i.status === "open"; }).length;
  document.querySelector("#s2").textContent =
    items.filter(function (i) { return i.type === "found" && i.status === "open"; }).length;
  document.querySelector("#s3").textContent =
    items.filter(function (i) { return i.status === "matched"; }).length;
  document.querySelector("#s4").textContent =
    items.filter(function (i) { return i.status === "returned"; }).length;
}

function render() {
  const grid = document.querySelector("#grid");
  const visibleItems = getVisibleItems();
  updateStats();

  if (visibleItems.length === 0) {
    grid.innerHTML = "<p>No items found.</p>";
    return;
  }

  grid.innerHTML = "";   // clear old cards first

  visibleItems.forEach(function (item) {
    const card = document.createElement("button");
    card.className = "card " + item.type;      // "card lost" or "card found"

    // the image: use the real one if it exists, otherwise a grey box
    const picture = item.image
      ? `<img class="card-img" src="${item.image}" alt="${item.name}">`
      : `<div class="card-img placeholder">No photo</div>`;

    card.innerHTML = `
      ${picture}
      <h3>${item.name}</h3>
      <div class="meta">${item.category}</div>
      <div class="meta">${item.place}</div>
      <div class="meta">${item.date}</div>
      <div class="foot"><span>${item.status}</span></div>
    `;

    grid.appendChild(card);
  });
}

// POST: runs when "Save report" is clicked
form.addEventListener("submit", async function (event) {
  event.preventDefault();   // stop the default dialog behaviour

  const ticket = {
    itemName: document.querySelector("#fName").value,
    category: document.querySelector("#fCat").value,
    eventDate: document.querySelector("#fDate").value,
    location: document.querySelector("#fPlace").value,
    contactName: document.querySelector("#fPerson").value,
    contactInfo: document.querySelector("#fContact").value,
    description: document.querySelector("#fDesc").value,
    type: formType.toUpperCase()   // "LOST" or "FOUND"
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket)
    });
    if (!response.ok) throw new Error("Server error");

    formDialog.close();
    loadItems();   // refresh the cards
  } catch (error) {
    console.error("Could not save ticket:", error);
    alert("Could not save the report. Is the backend running?");
  }
});

document.querySelector("#q").addEventListener("input", render);
document.querySelector("#cat").addEventListener("change", render);
document.querySelector("#sort").addEventListener("change", render);

loadItems();
