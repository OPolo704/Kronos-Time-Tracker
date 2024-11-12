// activity button, list, and stuff

const activitybtn = document.querySelector(".activity-btn");
const activityList = document.querySelector(".activity-list");
const activityAddbtn = document.querySelector(".activity-add");

if (categoryData) {
  categoryData.forEach((cat) => {
    const newbtn = document.createElement("button");
    newbtn.textContent = cat.name;
    newbtn.onclick = (event) => {
      activitySelect(event.target.textContent);
      console.log(selectedActivity);
    };

    activityList.prepend(newbtn);
  });
}

activitybtn.onclick = () => {
  activityList.classList.toggle("hidden");
};

activityAddbtn.onclick = () => {
  createButton();
};

function createButton() {
  const newbtn = document.createElement("button");
  const btninput = document.createElement("input");
  btninput.maxLength = 32;
  newbtn.appendChild(btninput);

  activityList.insertBefore(newbtn, activityAddbtn);
  btninput.focus();

  btninput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      btninput.blur();
    }
  });

  btninput.addEventListener("blur", function () {
    finalizeButton(newbtn);
  });
}

function finalizeButton(newbtn) {
  categoryName = newbtn.querySelector("input").value;
  if (!categoryName) {
    categoryName = "Unnamed Category";
  }

  const newCategory = new Category(categoryName);

  if (!categoryData.some((obj) => obj.name === categoryName)) {
    // if name unique
    categoryData.push(newCategory);
    newbtn.onclick = (event) => {
      activitySelect(event.target.textContent);
      console.log(selectedActivity);
    };

    newbtn.removeChild(newbtn.lastChild);
    newbtn.textContent = categoryName;
  } else {
    // for repeated names
    const btninput = newbtn.querySelector("input");
    if (categoryName.length + 4 <= btninput.maxLength) {
      btninput.value = categoryName + " (1)";
    }
    btninput.focus();
  }
}

function activitySelect(category) {
  activity = categoryData.find((obj) => obj.name === category);

  selectedActivity = activity;
  activitybtn.textContent = selectedActivity.name;

  activityList.classList.add("hidden");
}

// session data and timer button stuff

let selectedActivity = catUnsorted;
let newSession = new Session();

const startbtn = document.querySelector(".start-btn");

startbtn.onclick = () => {
  icon = startbtn.querySelector("i");
  if (newSession.endTime || !newSession.startTime) {
    startTimer();
    icon.className = "fa-solid fa-square";
    console.log("starting timer yay");
  } else {
    stopTimer();
    icon.className = "fa-solid fa-play";
    console.log("ending timer yay");
    console.log("duration length has been " + newSession.getDuration() + " ms");
  }
};

function startTimer() {
  newSession = new Session();

  newSession.startTime = new Date();
  newSession.endTime = undefined;
}

function stopTimer() {
  newSession.endTime = new Date();
  newSession.category = selectedActivity;

  sessionData.push(newSession);
}

//account button

const accountbtn = document.querySelector(".account-btn");
const accountText = document.querySelector(".account-text");

accountbtn.onclick = () => {
  if (!accessToken) {
    authenticateUser();
  } else {
    toggleAccountMenu();
  }
};

// ACCOUNT MENU

const accountMenuPage = document.querySelector(".account-menu-page");

function toggleAccountMenu() {
  accountMenuPage.classList.toggle("hidden");
}
