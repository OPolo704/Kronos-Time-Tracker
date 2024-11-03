categoryData = JSON.parse(sessionStorage.getItem("categoryData"));
sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
let viewedCategories = [...categoryData];

// CATEGORY MANAGER

const categoriesbtn = document.querySelector(".categories-btn");
const categoryManager = document.querySelector(".category-manager");
const categoryManagerList = document.querySelector(".category-manager-list");

createCategoryManagerList();

function createCategoryManagerList() {
  categoryData.forEach((cat) => {
    const catElement = document.createElement("li");
    catElement.textContent = cat.name;
    catElement.classList.add("category-manager-element");

    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("category-options");

    const eye = document.createElement("i");
    eye.classList.add("fa-solid", "fa-eye");
    eye.onclick = (event) => {
      toggleViewCategory(event.target);
    };
    optionsDiv.appendChild(eye);

    const pencil = document.createElement("i");
    optionsDiv.appendChild(pencil);
    pencil.classList.add("fa-solid", "fa-pen-to-square");

    const trash = document.createElement("i");
    trash.classList.add("fa-solid", "fa-trash");
    optionsDiv.appendChild(trash);

    catElement.appendChild(optionsDiv);

    categoryManagerList.appendChild(catElement);
  });
}

function toggleViewCategory(button) {
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
