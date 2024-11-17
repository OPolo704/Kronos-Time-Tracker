let viewedCategories =
  JSON.parse(sessionStorage.getItem("viewedCategories")) || [];

const defaultColors = [
  "#f0afaf",
  "#aff0f0",
  "#d2aff0",
  "#f0dcaf",
  "#aff0c1",
  "#afb3f0",
];

// STAT CALCULATION

function processData() {
  let data = [];
  viewedCategories.forEach((cat) => {
    let catDuration = 0;
    sessionData[cat.id].forEach((session) => {
      catDuration += session.getDuration();
    });
    const catData = {
      name: cat.name,
      duration: catDuration,
    };
    data.push(catData);
  });
  processedData = data;
  // have to be switching since weird thing where having a border on the parent element affects the dimensions of the canvas making it smaller than the empty circle in the background
  if (processedData.length !== 0) {
    ctx.parentElement.style.border = "none";
  } else {
    ctx.parentElement.style.border = "solid 3px #929191";
  }
}

// STAT PAGE
const ctx = document.getElementById("pie-chart");

let processedData = [];
processData();

const pieChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: processedData.map((catData) => catData.name),
    datasets: [
      {
        label: "Time spent in ms",
        data: processedData.map((catData) => catData.duration),
        backgroundColor: defaultColors,
        borderWidth: 3,
        borderColor: "#929191",
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});

const categoryListGrid = document.querySelector(".category-list-grid");

function printCategories() {
  categoryListGrid.innerHTML = "";

  viewedCategories.forEach((cat, index) => {
    const listItem = document.createElement("div");
    listItem.classList.add("category-list-item");

    const colorBox = document.createElement("div");
    colorBox.style.backgroundColor = defaultColors[index];
    listItem.appendChild(colorBox);

    const categoryText = document.createElement("div");
    categoryText.textContent = cat.name;
    listItem.appendChild(categoryText);

    categoryListGrid.appendChild(listItem);
  });
}

// CATEGORY MANAGER

const categoriesbtn = document.querySelector(".categories-btn");
const categoryAddbtn = document.querySelector(".category-add-btn");
const categoryManager = document.querySelector(".category-manager");
const categoryManagerList = document.querySelector(".category-manager-list");

printCategories();
createCategoryManagerList();

function createCategoryManagerElement(cat) {
  const catElement = document.createElement("li");
  const catElementName = document.createElement("span");
  catElementName.textContent = cat.name;

  const checkbox = document.createElement("i");
  if (viewedCategories.some((obj) => obj.id === cat.id)) {
    checkbox.classList.add("fa-regular", "fa-square-check");
  } else {
    checkbox.classList.add("fa-regular", "fa-square");
  }
  catElementName.appendChild(checkbox);
  catElementName.onclick = (event) => {
    categoryToggleView(event.currentTarget);
  };

  catElement.appendChild(catElementName);
  catElement.classList.add("category-manager-element");

  const optionsDiv = document.createElement("div");
  optionsDiv.classList.add("category-options");

  const eye = document.createElement("i");
  if (cat.activity) {
    eye.classList.add("fa-solid", "fa-eye");
  } else {
    eye.classList.add("fa-solid", "fa-eye-slash");
  }
  eye.onclick = (event) => {
    categoryToggleActivity(event.target);
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
  trash.onclick = (event) => {
    categoryDelete(event.target);
  };
  optionsDiv.appendChild(trash);

  catElement.appendChild(optionsDiv);

  categoryManagerList.insertBefore(
    catElement,
    document.querySelector(".category-add-btn")
  );

  catElement.draggable = true;
  catElement.addEventListener("dragstart", () => {
    catElement.classList.add("dragging");
  });

  catElement.addEventListener("dragend", () => {
    catElement.classList.remove("dragging");

    if (catElement.nextSibling !== categoryAddbtn) {
      const categoryIndex = categoryData.findIndex((element) => {
        return element.name === catElement.textContent;
      });
      const categoryBeforeIndex = categoryData.findIndex((element) => {
        return element.name === catElement.nextSibling.textContent;
      });

      categoryData.splice(
        categoryBeforeIndex,
        0,
        categoryData.splice(categoryIndex, 1)[0]
      );
      console.log(categoryData);
    } else {
      const categoryIndex = categoryData.findIndex((cat) => {
        return cat.name === catElement.textContent;
      });

      categoryData.push(categoryData.splice(categoryIndex, 1)[0]);
    }
  });

  catElement.addEventListener("dragover", (event) => {
    event.preventDefault();
    const dragged = document.querySelector(".dragging");
    const rect = catElement.getBoundingClientRect();

    // const x = event.clientX - rect.x;
    // const y = event.clientY - rect.y;
    const middleLine = (rect.y + rect.bottom) / 2;

    if (event.clientY < middleLine) {
      categoryManagerList.insertBefore(dragged, catElement);
    } else {
      categoryManagerList.insertBefore(dragged, catElement.nextSibling);
    }
  });
}

function updateViewedCategories() {
  viewedCategories = [];
  for (let i = 0; i < categoryManagerList.children.length - 1; i++) {
    const categoryName = categoryManagerList.children[i].textContent;
    if (categoryManagerList.children[i].querySelector(".fa-square-check")) {
      viewedCategories.push(
        categoryData.find((obj) => obj.name === categoryName)
      );
    }
  }

  sessionStorage.setItem("viewedCategories", JSON.stringify(viewedCategories));
}

function categoryToggleView(button) {
  const icon = button.querySelector("i");

  if (icon.classList.contains("fa-square-check")) {
    icon.classList.replace("fa-square-check", "fa-square");
  } else {
    icon.classList.replace("fa-square", "fa-square-check");
  }
}

function categoryToggleActivity(button) {
  const categoryName = button.parentElement.parentElement.textContent;

  const category = categoryData.find((obj) => obj.name === categoryName);
  if (category.activity) {
    button.classList.replace("fa-eye", "fa-eye-slash");
    category.activity = false;
  } else {
    button.classList.replace("fa-eye-slash", "fa-eye");
    category.activity = true;
  }
}

function categoryRename(button) {
  const categoryElement = button.parentElement.parentElement;
  const categoryName = button.parentElement.parentElement.textContent;
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
    let newCategoryName;
    if (btninput.value === "") {
      newCategoryName = categoryName;
    } else {
      newCategoryName = btninput.value;
    }
    categoryElement.removeChild(btninput);

    const categoryElementName = document.createElement("span");
    categoryElementName.textContent = newCategoryName;
    categoryElement.prepend(categoryElementName);

    const checkbox = document.createElement("i");
    checkbox.classList.add("fa-regular", "fa-square-check");
    categoryElementName.appendChild(checkbox);
    categoryElementName.onclick = (event) => {
      categoryToggleView(event.currentTarget);
    };

    const activity = categoryData.find((obj) => obj.name === categoryName);
    activity.name = newCategoryName;
  });
}

function categoryDelete(button) {
  const categoryElement = button.parentElement.parentElement;
  const categoryName = button.parentElement.parentElement.textContent;
  const categoryIndex = categoryData.findIndex(
    (obj) => obj.name === categoryName
  );

  // ADD POP UP TO CONFIRM DECISION, DELETES ALL SESSIONS ASSOCIATED WITH CATEGORY
  sessionData[categoryData[categoryIndex].id] = [];
  categoryData.splice(categoryIndex, 1);
  categoryManagerList.removeChild(categoryElement);
}

function categoryManagerToggle() {
  categoryManager.classList.toggle("hidden");
}

categoriesbtn.onclick = categoryManagerToggle;

function categoryManagerClose() {
  updateViewedCategories();
  processData();
  pieChart.data.labels = processedData.map((catData) => catData.name);
  pieChart.data.datasets[0].data = processedData.map(
    (catData) => catData.duration
  );
  pieChart.update();
  printCategories();
  categoryManagerToggle();
}

function createCategoryManagerList() {
  categoryData.forEach((cat) => {
    createCategoryManagerElement(cat);
  });
}

categoryAddbtn.onclick = () => {
  const newCategory = new Category("");
  categoryData.push(newCategory);
  createCategoryManagerElement(newCategory);
  categoryRename(
    categoryAddbtn.previousSibling.querySelector(".fa-pen-to-square")
  );
};

function toglersRefresh() {
  const toggler = document.querySelectorAll(".caret");

  for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function () {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
}
