categoryData = JSON.parse(sessionStorage.getItem("categoryData"));
sessionData = JSON.parse(sessionStorage.getItem("sessionData"));

// CATEGORY MANAGER

const categoriesbtn = document.querySelector(".categories-btn");
const categoryManager = document.querySelector(".category-manager");
const categoryManagerList = document.querySelector(".category-manager-list");

createCategoryManagerList();

function createCategoryManagerList() {
  categoryData.forEach((cat) => {
    const catElement = document.createElement("li");
    catElement.textContent = cat.name;

    categoryManagerList.appendChild(catElement);
  });
}

categoriesbtn.onclick = () => {
  categoryManager.classList.remove("hidden");
};

const toggler = document.querySelectorAll(".caret");

for (let i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function () {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  });
}
