// activity button, list, and stuff

const activitybtn = document.querySelector(".activity-btn");
const activityList = document.querySelector(".activity-list");
const activityAddbtn = document.querySelector(".activity-add");

activitybtn.onclick = () => {
  activityList.classList.toggle("hidden");
};

function createButton() {
  const newbtn = document.createElement("button");
  const btninput = document.createElement("input");
  btninput.maxLength = 32;
  newbtn.appendChild(btninput);

  activityList.prepend(newbtn);
  btninput.focus();

  btninput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      btninput.blur();
    }
  });

  btninput.addEventListener("blur", function () {
    finalizeButton(btninput.value);
  });
}

function finalizeButton(categoryName) {
  if (!categoryName) {
    categoryName = "Unnamed Category";
  }

  const newCategory = new Category(categoryName);

  if (!categoryData.some((obj) => obj.name === categoryName)) {
    // if name unique
    categoryData.push(newCategory);
    const newbtn = activityList.firstChild;
    newbtn.onclick = (event) => {
      activitySelect(event.target.textContent);
      console.log(selectedActivity);
    };

    newbtn.removeChild(newbtn.lastChild);
    newbtn.textContent = categoryName;
  } else {
    // for repeated names
    const btninput = activityList.firstChild.querySelector("input");
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
  let n = 1; // this and below is to maintain the activity name's length suitable for the width of the button
  while (activitybtn.scrollWidth > activitybtn.clientWidth) {
    activitybtn.textContent =
      selectedActivity.name.slice(0, selectedActivity.name.length - 1 - n) +
      "...";
    n++;
  }

  activityList.classList.add("hidden");
}

activityAddbtn.onclick = () => {
  createButton();
};

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
  newSession.category = selectedActivity;
}

function stopTimer() {
  newSession.endTime = new Date();
  sessionData.push(newSession);

  // updateDrive(sessionData);
}

const accountbtn = document.querySelector(".account-btn");
const accountText = document.querySelector(".account-text");

accountbtn.onclick = () => {
  if (!accessToken) {
    authenticateUser();
  } else {
    // maybe add settings page or log out or something
  }
};
