//for filter-button
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

    if (button.dataset.new === "lost") {
      formTitle.textContent = "Report lost item";
    } else {
      formTitle.textContent = "Register found item";
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

async function loadCategories() {
  let categories;

  try {
    const response = await fetch("/api/categories");   // your backend address
    if (!response.ok) throw new Error("Server error");
    categories = await response.json();
  } catch (error) {
    console.log("Could not load categories, using defaults:", error);
    categories = defaultCategories;
  }

  fillSelect(document.querySelector("#fCat"), categories);   // form dropdown
  fillSelect(document.querySelector("#cat"), categories);    // filter dropdown
}

loadCategories();





// TEMPORARY: delete this when the backend is ready
let items = [
  {
    id: 1,
    type: "lost",                      // "lost" or "found"
    name: "Black leather wallet",
    category: "Bags & wallets",
    place: "Main library, 2nd floor",
    date: "2026-09-29",
    image: null,                       // later: a URL like "/uploads/wallet.jpg"
    description: "Contains student ID",
    status: "open"                     // "open", "matched" or "returned"
  },
  {
    id: 2,
    type: "found",
    name: "Blue umbrella",
    category: "Other",
    place: "Bus stop entrance",
    date: "2026-10-01",
    image: null,
    description: "",
    status: "open"
  }
];

function render() {
  const grid = document.querySelector("#grid");

  if (items.length === 0) {
    grid.innerHTML = "<p>No items yet.</p>";
    return;
  }

  grid.innerHTML = "";   // clear old cards first

  items.forEach(function (item) {
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

render();
