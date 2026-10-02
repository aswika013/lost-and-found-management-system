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