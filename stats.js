let viewedCategories = [];

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
createCategoryManagerList(categoryData, categoryManagerList);
nestedCategoriesRefresh();

function createCategoryManagerElement(cat, listElement) {
  const catElement = document.createElement("li");
  const catElementDetails = document.createElement("div");
  const catElementName = document.createElement("span");
  catElementName.textContent = cat.name;

  const caretDiv = document.createElement("div");
  caretDiv.classList.add("caret-down");
  caretDiv.onclick = (event) => {
    event.currentTarget.parentElement.parentElement
      .querySelector(".nested")
      .classList.toggle("active");
    event.currentTarget.classList.toggle("caret-down");
  };

  const checkbox = document.createElement("i");
  checkbox.classList.add("fa-regular", "fa-square");
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
  subCategoryList.classList.add("active");
  if (cat.subCategories.length !== 0) {
    createCategoryManagerList(cat.subCategories, subCategoryList);
  }
  catElement.appendChild(subCategoryList);
  listElement.appendChild(catElement);

  catElement.querySelector(".category-manager-element").draggable = true;
  catElement
    .querySelector(".category-manager-element")
    .addEventListener("dragstart", () => {
      catElement.classList.add("dragging");
      catElement.querySelector(".nested").classList.remove("active");
      catElement
        .querySelector(".category-manager-element")
        .firstChild.classList.remove("caret-down");
    });

  catElement.addEventListener("dragend", (event) => {
    event.stopPropagation(); // this shit fucked me up
    catElement.classList.remove("dragging");

    const parentCategory = (() => {
      for (let i = 0; i < categoryData.length; i++) {
        if (
          categoryData[i].name === catElement.querySelector("span").textContent
        ) {
          return categoryData;
        } else if (categoryData[i].subCategories.length !== 0) {
          const result = findParentCategory(
            categoryData[i],
            catElement.querySelector("span").textContent
          );
          if (result !== null) {
            return result;
          }
        }
      }
      return null;
    })();

    let categoryObject;
    if (parentCategory === categoryData) {
      const categoryIndex = categoryData.findIndex(
        (category) => category.name === catElement.textContent
      );

      categoryObject = categoryData.splice(categoryIndex, 1)[0];
    } else {
      const categoryIndex = parentCategory.subCategories.findIndex(
        (category) => category.name === catElement.textContent
      );

      categoryObject = parentCategory.subCategories.splice(categoryIndex, 1)[0];
    }

    if (catElement.parentElement === categoryManagerList) {
      const categoryIndex = [...categoryManagerList.children].indexOf(
        catElement
      );

      categoryData.splice(categoryIndex, 0, categoryObject);
    } else {
      const newParentCategoryName =
        catElement.parentElement.parentElement.querySelector(
          "span"
        ).textContent;
      const newParentCategory = findCategory(
        categoryData,
        newParentCategoryName
      );

      const categoryIndex = [...catElement.parentElement.children].indexOf(
        catElement
      );

      newParentCategory.subCategories.splice(categoryIndex, 0, categoryObject);
    }
  });

  catElement
    .querySelector(".category-manager-element")
    .addEventListener("dragover", (event) => {
      event.preventDefault();
      const dragged = document.querySelector(".dragging");
      const rect = catElement.getBoundingClientRect();

      const middleLine = (rect.y + rect.bottom) / 2;
      const middleLineHorizontal = (rect.x + rect.right) / 4;

      const categoryParentElement = catElement.parentElement;
      if (catElement === dragged) {
        if (
          event.clientX > middleLineHorizontal &&
          categoryParentElement.children[0] !== catElement
        ) {
          catElement.previousSibling
            .querySelector(".category-manager-element")
            .querySelector("div")
            .classList.add("caret-down");
          catElement.previousSibling
            .querySelector(".nested")
            .classList.add("active");
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
              .querySelector(".category-manager-element")
              .querySelector("div")
              .classList.add("caret-down");
            catElement.previousSibling
              .querySelector(".nested")
              .appendChild(dragged);
            catElement.previousSibling
              .querySelector(".nested")
              .classList.add("active");
            nestedCategoriesRefresh();
          }
        }
      } else {
        if (event.clientX < middleLineHorizontal) {
          categoryParentElement.insertBefore(dragged, catElement.nextSibling); // works even when there is no next sibling since it'd be null and insertBefore null defaults to inserting at end
          nestedCategoriesRefresh();
        } else {
          catElement
            .querySelector(".category-manager-element")
            .querySelector("div")
            .classList.add("caret-down");
          catElement.querySelector(".nested").appendChild(dragged);
          catElement.querySelector(".nested").classList.add("active");
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
  function checkCategoryArray(listElement) {
    let length = listElement.children.length;
    for (let i = 0; i < length; i++) {
      if (
        listElement.children[i]
          .querySelector("div")
          .querySelector(".fa-square-check")
      ) {
        const categoryName =
          listElement.children[i].querySelector("div").textContent;
        viewedCategories.push(findCategory(categoryData, categoryName));
      } else if (
        listElement.children[i].querySelector("ul").children.length > 0
      ) {
        checkCategoryArray(listElement.children[i].querySelector("ul"));
      }
    }
  }
  viewedCategories = [];
  checkCategoryArray(categoryManagerList);
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

  const category = findCategory(categoryData, categoryName);
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

    const activity = findCategory(categoryData, categoryName);
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

function createCategoryManagerList(categoryArray, categoryArrayElement) {
  categoryArray.forEach((cat) => {
    createCategoryManagerElement(cat, categoryArrayElement);
  });
}

categoryAddbtn.onclick = () => {
  const newCategory = new Category("");
  categoryData.push(newCategory);
  createCategoryManagerElement(newCategory, categoryManagerList);
  categoryRename(
    categoryManagerList.lastElementChild.querySelector(".fa-pen-to-square")
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
