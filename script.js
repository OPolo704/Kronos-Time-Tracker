// activity button, list, and stuff

const activitybtn = document.querySelector(".activity-btn");
const activityList = document.querySelector(".activity-list");
const activityAddbtn = document.querySelector(".activity-add-btn");

// print activity list
if (categoryData) {
  forEachCategory(categoryData, (cat) => {
    if (cat.activity) {
      const newbtn = document.createElement("button");
      newbtn.textContent = cat.name;
      newbtn.onclick = (event) => {
        activitySelect(event.target.textContent);
        console.log(selectedActivity);
      };

      activityList.insertBefore(newbtn, activityAddbtn);
    }
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

  if (!categoryData.some((obj) => obj.name === categoryName)) {
    const newCategory = new Category(categoryName);
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

function activitySelect(categoryName) {
  activity = findCategory(categoryData, categoryName);

  selectedActivity = activity;
  activitybtn.textContent = selectedActivity.name;

  activityList.classList.add("hidden");
}

// session data and timer button stuff

let selectedActivity = null;
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
  let newSessionID;
  if (selectedActivity === null) {
    newSessionID = 0;
  } else {
    newSessionID = selectedActivity.id;
  }

  const splittedSession = splitSession(newSession);

  for (let i = splittedSession.length - 1; i >= 0; i--) {
    // min session length of 5min
    if (splittedSession[i].getDuration() > 300000) {
      sessionData[newSessionID].push(splittedSession[i]);
    }
  }
}

function splitSession(session) {
  if (
    session.startTime.getDate() !== session.endTime.getDate() ||
    session.startTime.getMonth() !== session.endTime.getMonth()
  ) {
    const fragmentSession = new Session();
    fragmentSession.endTime = session.endTime;
    fragmentSession.startTime = new Date("November 30, 2024 00:00:00");
    fragmentSession.startTime.setDate(session.endTime.getDate());

    const remainingSessions = new Session();
    remainingSessions.startTime = session.startTime;
    remainingSessions.endTime = new Date(
      session.endTime.getFullYear(),
      session.endTime.getMonth(),
      session.endTime.getDate() - 1,
      23,
      59,
      59
    );
    return [fragmentSession, ...splitSession(remainingSessions)];
  } else {
    return [session];
  }
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
