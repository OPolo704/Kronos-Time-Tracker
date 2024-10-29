// fundamental structural stuff
class Session {
  constructor() {
    this.name = "Untitled Session";
    this.startTime;
    this.endTime;
    this.category = catUnsorted;
  }

  setName(name) {
    if (name && typeof name === "string") {
      this.name = name;
    } else {
      console.log("What you have entered is not a valid name."); //implement UI change
    }
  }

  setCategory(category) {
    if (category) {
      this.category = category;
    } else {
      console.log("category does not exist"); // implement UI change
    }
  }

  getDuration() {
    return this.endTime - this.startTime;
  }
}

class Category {
  constructor(name) {
    this.name = name;
    this.subCategories = [];
  }

  setName(name) {
    this.name = name;
  }

  addSubCategory(subcat) {
    subCategories.push(subcat);
  }
}

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
}

activityAddbtn.onclick = () => {
  createButton();
};

// session data and timer button stuff

let sessionData = [];
let categoryData = [];
let catUnsorted = new Category("Unsorted");
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

function updateDrive(newData) {
  const file = new Blob([JSON.stringify(newData)], {
    type: "application/json",
  });
  const metadata = {
    name: "timelineData.json",
    mimeType: "application/json",
  };

  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  formData.append("file", file);

  fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      body: formData,
    }
  )
    .then((response) => response.json())
    .then((result) => {
      console.log("File uploaded successfully:", result);
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
    });
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

// google api stuff below
let accessToken;

function initializeGapiClient() {
  const clientId =
    "464182844080-mm081mvubig8flsh4vk21t03k30b2ft3.apps.googleusercontent.com";

  const auth = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (tokenResponse) => {
      console.log("User signed in:", tokenResponse);
      accessToken = tokenResponse.access_token;
      accountText.textContent = "Logged in"; // account button changes status
    },
  });

  return auth;
}

function authenticateUser() {
  const auth = initializeGapiClient();
  auth.requestAccessToken();
}
