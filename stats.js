categoryData = JSON.parse(sessionStorage.getItem("categoryData"));
sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
let viewedCategories = [...categoryData];

// STAT PAGE
const categoryListGrid = document.querySelector(".category-list-grid");

function printCategories() {
  categoryListGrid.innerHTML = "";

  viewedCategories.forEach((cat) => {
    const listItem = document.createElement("div");
    listItem.classList.add("category-list-item");
    listItem.appendChild(document.createElement("div"));

    const categoryText = document.createElement("div");
    categoryText.textContent = cat.name;
    listItem.appendChild(categoryText);

    categoryListGrid.appendChild(listItem);
  });
}

// CATEGORY MANAGER

const categoriesbtn = document.querySelector(".categories-btn");
const categoryManager = document.querySelector(".category-manager");
const categoryManagerList = document.querySelector(".category-manager-list");

printCategories();
createCategoryManagerList();

function createCategoryManagerList() {
  categoryData.forEach((cat) => {
    const catElement = document.createElement("li");
    const catElementName = document.createElement("span");
    catElementName.textContent = cat.name;
    catElement.appendChild(catElementName);
    catElement.classList.add("category-manager-element");

    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("category-options");

    const eye = document.createElement("i");
    eye.classList.add("fa-solid", "fa-eye");
    eye.onclick = (event) => {
      categoryToggleView(event.target);
    };
    optionsDiv.appendChild(eye);

    const pencil = document.createElement("i");
    pencil.classList.add("fa-solid", "fa-pen-to-square");
    pencil.onclick = (event) => {
      categoryRename(event.target);
    };
    optionsDiv.appendChild(pencil);

    const trash = document.createElement("i");
    trash.classList.add("fa-solid", "fa-trash");
    optionsDiv.appendChild(trash);

    catElement.appendChild(optionsDiv);

    categoryManagerList.appendChild(catElement);
  });
}

function categoryToggleView(button) {
  const category = button.parentElement.parentElement.textContent;

  const index = viewedCategories.findIndex((obj) => obj.name === category);
  if (index !== -1) {
    button.classList.replace("fa-eye", "fa-eye-slash");
    viewedCategories.splice(index, 1);
  } else {
    button.classList.replace("fa-eye-slash", "fa-eye");
    viewedCategories.push(categoryData.find((obj) => obj.name === category));
  }
}

function categoryRename(button) {
  const categoryElement = button.parentElement.parentElement;
  const category = button.parentElement.parentElement.textContent;
  categoryElement.querySelector("span").textContent = "";

  const btninput = document.createElement("input");
  btninput.maxLength = 32;
  categoryElement.prepend(btninput);
  btninput.focus();

  btninput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      btninput.blur();
    }
  });

  btninput.addEventListener("blur", function () {
    let newCategory;
    if (btninput.value === "") {
      newCategory = category;
    } else {
      newCategory = btninput.value;
    }
    categoryElement.removeChild(btninput);

    const categoryElementName = document.createElement("span");
    categoryElementName.textContent = newCategory;
    categoryElement.prepend(categoryElementName);

    const activity = categoryData.find((obj) => obj.name === category);
    activity.name = newCategory;
  });
}

function categoryManagerToggle() {
  categoryManager.classList.toggle("hidden");
}

categoriesbtn.onclick = categoryManagerToggle;

const toggler = document.querySelectorAll(".caret");

for (let i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function () {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  });
}
