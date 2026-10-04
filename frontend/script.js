//for filter-button
const BACKEND = "http://localhost:8081";
const API_URL = BACKEND + "/api/tickets";

let editingId = null;   // null = creating a new ticket, a number = editing that ticket
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

function setFormLabels(kind, editing) {
  const word = kind === "lost" ? "lost" : "found";

  formTitle.textContent = editing
    ? "Edit " + word + " item"
    : (kind === "lost" ? "Report lost item" : "Register found item");

  document.querySelector("#fDateL").textContent = kind === "lost" ? "Date lost" : "Date found";
  document.querySelector("#fPlaceL").textContent = kind === "lost" ? "Where was it lost?" : "Where was it found?";
  document.querySelector("#fPersonL").textContent = kind === "lost" ? "Owner name" : "Finder name";
  document.querySelector("#fSave").textContent = editing ? "Save changes" : "Save report";
}

newButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    form.reset();
    editingId = null;
    formType = button.dataset.new;
    setFormLabels(formType, false);
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
    contactName: ticket.contactName,
    contactInfo: ticket.contactInfo,
    place: ticket.location,
    date: ticket.eventDate,
    image: ticket.imageUrl ? BACKEND + ticket.imageUrl : null,
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

const viewDialog = document.querySelector("#viewDlg");
const viewBox = document.querySelector("#view");

function openDetails(item) {
  const statuses = ["open", "matched", "returned"];

  const statusButtons = statuses.map(function (s) {
    return `<button type="button" class="btn ${s === item.status ? "dark" : "ghost"}"
              data-status="${s}" ${s === item.status ? "disabled" : ""}>
              Mark ${s}
            </button>`;
  }).join("");

  viewBox.innerHTML = `
    <h2>${item.name}</h2>
    <p class="meta">${item.type === "lost" ? "Lost" : "Found"} item · ${item.category}</p>
    <p class="meta">Place: ${item.place}</p>
    <p class="meta">Date: ${item.date}</p>
    <p class="meta">Contact: ${item.contactName || "-"} (${item.contactInfo || "-"})</p>
    <p>${item.description || "No description"}</p>
    <p class="meta">Status: <b>${item.status}</b></p>
    <div class="acts">
      <button type="button" class="btn ghost" id="vClose">Close</button>
      <button type="button" class="btn ghost" id="vEdit">Edit</button>
      <button type="button" class="btn ghost" id="vDelete">Delete</button>
      ${statusButtons}
    </div>
  `;

  viewBox.querySelector("#vClose").addEventListener("click", function () {
    viewDialog.close();
  });

    viewBox.querySelector("#vEdit").addEventListener("click", function () {
    openEdit(item);
  });

  viewBox.querySelector("#vDelete").addEventListener("click", function () {
    const sure = confirm('Delete "' + item.name + '"? This cannot be undone.');
    if (sure) {
      deleteTicket(item.id);
    }
  });

  viewBox.querySelectorAll("[data-status]").forEach(function (button) {
    button.addEventListener("click", function () {
      setStatus(item.id, button.dataset.status);
    });
  });

  viewDialog.showModal();
}

// PATCH: change a ticket's status in the backend
async function setStatus(id, status) {
  try {
    const response = await fetch(API_URL + "/" + id + "/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status.toUpperCase() })
    });
    if (!response.ok) throw new Error("Server error");

    viewDialog.close();
    loadItems();   // refresh cards and stats
  } catch (error) {
    console.error("Could not update status:", error);
    alert("Could not update the status. Is the backend running?");
  }
}

// DELETE: remove a ticket from the backend
async function deleteTicket(id) {
  try {
    const response = await fetch(API_URL + "/" + id, { method: "DELETE" });
    if (!response.ok) throw new Error("Server error");

    viewDialog.close();
    loadItems();   // refresh cards and stats
  } catch (error) {
    console.error("Could not delete ticket:", error);
    alert("Could not delete the ticket. Is the backend running?");
  }
}

function openEdit(item) {
  viewDialog.close();
  form.reset();

  editingId = item.id;
  formType = item.type;
  setFormLabels(item.type, true);

  document.querySelector("#fName").value = item.name;
  document.querySelector("#fCat").value = item.category;
  document.querySelector("#fDate").value = item.date;
  document.querySelector("#fPlace").value = item.place;
  document.querySelector("#fPerson").value = item.contactName || "";
  document.querySelector("#fContact").value = item.contactInfo || "";
  document.querySelector("#fDesc").value = item.description || "";

  formDialog.showModal();
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

      card.addEventListener("click", function () {
      openDetails(item);
    });

    grid.appendChild(card);
  });
}

// POST: runs when "Save report" is clicked
form.addEventListener("submit", async function (event) {
  event.preventDefault();

    const photo = document.querySelector("#fImage").files[0];
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (photo && !allowedTypes.includes(photo.type)) {
    alert("Please upload a JPEG, JPG, PNG or WEBP picture only.");
    return;
  }
  if (photo && photo.size > 5 * 1024 * 1024) {
    alert("The picture is too large. Please choose one under 5 MB.");
    return;
  }

  const ticket = {
    itemName: document.querySelector("#fName").value,
    category: document.querySelector("#fCat").value,
    eventDate: document.querySelector("#fDate").value,
    location: document.querySelector("#fPlace").value,
    contactName: document.querySelector("#fPerson").value,
    contactInfo: document.querySelector("#fContact").value,
    description: document.querySelector("#fDesc").value,
    type: formType.toUpperCase()
  };

  const isEditing = editingId !== null;

  if (isEditing) {
    const current = items.find(function (i) { return i.id === editingId; });
    ticket.status = current.status.toUpperCase();
  }

  const url = isEditing ? API_URL + "/" + editingId : API_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket)
    });
    if (!response.ok) throw new Error("Server error");

    // step 2: upload the photo, if one was chosen
    const saved = await response.json();
    const file = document.querySelector("#fImage").files[0];

    if (file) {
      const data = new FormData();
      data.append("file", file);
      const imgResponse = await fetch(API_URL + "/" + saved.id + "/image", {
        method: "POST",
        body: data        // no Content-Type header: the browser sets it
      });
      if (!imgResponse.ok) throw new Error("Image upload failed");
    }

    editingId = null;
    formDialog.close();
    loadItems();
  } catch (error) {
    console.error("Could not save ticket:", error);
    alert("Could not save the report. Is the backend running?");
  }
});

document.querySelector("#q").addEventListener("input", render);
document.querySelector("#cat").addEventListener("change", render);
document.querySelector("#sort").addEventListener("change", render);

loadItems();
