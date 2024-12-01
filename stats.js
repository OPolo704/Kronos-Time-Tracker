let viewedCategories =
  JSON.parse(sessionStorage.getItem("viewedCategories")) || [];

// STAT CALCULATION

function processData() {
  let data = [];
  viewedCategories.forEach((cat) => {
    const catDuration = categoryDuration(cat);
    const catData = {
      name: cat.name,
      duration: catDuration,
      color: cat.color,
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

function categoryDuration(cat) {
  let catDuration = 0;
  sessionData[cat.id].forEach((session) => {
    catDuration += session.getDuration();
  });

  if (cat.subCategories.length > 0) {
    cat.subCategories.forEach((subcat) => {
      catDuration += categoryDuration(subcat);
    });
  }

  return catDuration;
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
        label: "Total time",
        data: processedData.map((catData) => catData.duration),
        backgroundColor: processedData.map((catData) => catData.color),
        borderWidth: 3,
        borderColor: "#929191",
      },
    ],
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const timeInMs = context.raw;
            const time =
              Math.floor(timeInMs / 3600000) +
              "h " +
              Math.floor((timeInMs / 60000) % 60) +
              "m";
            return "Total time: " + time;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  },
});

const categoryListGrid = document.querySelector(".category-list-grid");

function printCategories() {
  categoryListGrid.innerHTML = "";

  viewedCategories.forEach((cat) => {
    const listItem = document.createElement("div");
    listItem.classList.add("category-list-item");

    const colorBox = document.createElement("div");
    colorBox.style.backgroundColor = cat.color;
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
  const catElementDetails = document.createElement("div");
  const catElementName = document.createElement("span");
  catElementName.textContent = cat.name;

  const caretDiv = document.createElement("div");
  caretDiv.onclick = (event) => {
    event.currentTarget.parentElement.parentElement
      .querySelector(".nested")
      .classList.toggle("active");
    event.currentTarget.classList.toggle("caret-down");
  };

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

  catElementDetails.appendChild(caretDiv);
  catElementDetails.appendChild(catElementName);
  catElementDetails.classList.add("category-manager-element");

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

  catElementDetails.appendChild(optionsDiv);
  catElement.appendChild(catElementDetails);

  const subCategoryList = document.createElement("ul");
  subCategoryList.classList.add("nested");
  catElement.appendChild(subCategoryList);

  categoryManagerList.insertBefore(
    catElement,
    document.querySelector(".category-add-btn")
  );

  catElement.querySelector(".category-manager-element").draggable = true;
  catElement
    .querySelector(".category-manager-element")
    .addEventListener("dragstart", () => {
      console.log(catElement);
      catElement.classList.add("dragging");
      catElement.querySelector(".nested").classList.remove("active");
      catElement
        .querySelector(".category-manager-element")
        .firstChild.classList.remove("caret-down");
    });

  catElement.addEventListener("dragend", () => {
    catElement.classList.remove("dragging");

    if (catElement.nextSibling !== categoryAddbtn) {
      // this is the actual categoryData sort --> modify to include subcategories
      // const categoryIndex = categoryData.findIndex((element) => {
      //   return element.name === catElement.textContent;
      // });
      // const categoryBeforeIndex = categoryData.findIndex((element) => {
      //   return element.name === catElement.nextSibling.textContent;
      // });

      // categoryData.splice(
      //   categoryBeforeIndex,
      //   0,
      //   categoryData.splice(categoryIndex, 1)[0]
      // );
      console.log(categoryData);
    } else {
      const categoryIndex = categoryData.findIndex((cat) => {
        return cat.name === catElement.textContent;
      });

      categoryData.push(categoryData.splice(categoryIndex, 1)[0]);
    }
  });

  catElement
    .querySelector(".category-manager-element")
    .addEventListener("dragover", (event) => {
      event.preventDefault();
      const dragged = document.querySelector(".dragging");
      const rect = catElement.getBoundingClientRect();

      const middleLine = (rect.y + rect.bottom) / 2;
      const middleLineHorizontal = (rect.x + rect.right) / 6;

      const categoryParentElement = catElement.parentElement;
      console.log(catElement);
      if (catElement === dragged) {
        if (
          event.clientX > middleLineHorizontal &&
          categoryParentElement.children[0] !== catElement
        ) {
          catElement.previousSibling
            .querySelector(".nested")
            .appendChild(dragged);
          nestedCategoriesRefresh();
        }
      } else if (event.clientY < middleLine) {
        if (
          event.clientX < middleLineHorizontal ||
          categoryParentElement.children[0] === catElement
        ) {
          categoryParentElement.insertBefore(dragged, catElement);
          nestedCategoriesRefresh();
        } else {
          if (catElement.previousSibling !== dragged) {
            catElement.previousSibling
              .querySelector(".nested")
              .appendChild(dragged);
            nestedCategoriesRefresh();
          }
        }
      } else {
        if (event.clientX < middleLineHorizontal) {
          categoryParentElement.insertBefore(dragged, catElement.nextSibling);
          nestedCategoriesRefresh();
        } else {
          catElement.querySelector(".nested").appendChild(dragged);
          nestedCategoriesRefresh();
        }
      }
    });

  catElement.addEventListener("dragover", (event) => {
    const dragged = document.querySelector(".dragging");
    const categoryParentElement = catElement.parentElement;
    if (
      event.target.nodeName === "UL" &&
      event.target !== categoryManagerList
    ) {
      categoryParentElement.insertBefore(dragged, catElement.nextSibling);
      nestedCategoriesRefresh();
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

    const categoryElementName = categoryElement.querySelector("span");
    categoryElementName.textContent = newCategoryName;

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
  const categoryName =
    button.parentElement.parentElement.querySelector("span").textContent;
  const categoryIndex = categoryData.findIndex(
    (obj) => obj.name === categoryName
  );
  const categoryParentElement = categoryElement.parentElement.parentElement;

  // ADD POP UP TO CONFIRM DECISION, DELETES ALL SESSIONS ASSOCIATED WITH CATEGORY
  sessionData[categoryData[categoryIndex].id] = [];
  categoryData.splice(categoryIndex, 1);
  categoryParentElement.removeChild(categoryElement.parentElement);
  nestedCategoriesRefresh();
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
  pieChart.data.datasets[0].backgroundColor = processedData.map(
    (catData) => catData.color
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

function nestedCategoriesRefresh() {
  function checkNested(parentElement) {
    for (let i = 0; i < parentElement.children.length; i++) {
      const catElement = parentElement.children[i];
      if (catElement.querySelector(".nested")) {
        // added cuz the add category button can't complete the checks below
        if (catElement.querySelector(".nested").querySelector("li")) {
          checkNested(catElement.querySelector(".nested"));
          catElement
            .querySelector(".category-manager-element")
            .firstChild.classList.add("caret");
        } else {
          catElement
            .querySelector(".category-manager-element")
            .firstChild.classList.remove("caret");
        }
      }
    }
  }
  checkNested(categoryManagerList);
}
