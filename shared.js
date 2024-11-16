// fundamental structural stuff
class Session {
  constructor() {
    this.name = "Untitled Session";
    this.startTime;
    this.endTime;
  }

  setName(name) {
    if (name && typeof name === "string") {
      this.name = name;
    } else {
      console.log("What you have entered is not a valid name."); //implement UI change
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
    this.activity = true;
    this.id = id;
    sessionData[this.id] = [];
    id++;
  }

  setName(name) {
    this.name = name;
  }

  addSubCategory(subcat) {
    subCategories.push(subcat);
  }
}

let id = JSON.parse(sessionStorage.getItem("id")) || 1;
let categoryData = JSON.parse(sessionStorage.getItem("categoryData")) || [];
let sessionData = initializeSessionData(
  JSON.parse(sessionStorage.getItem("sessionData"))
) || [[]];

function initializeSessionData(sessionData) {
  if (!sessionData) {
    return null;
  }
  // when I start implementing subcats make a recursive function for initializing each of the arrays inside
  sessionData.forEach((category) => {
    category.forEach((sessionObject) => {
      const session = new Session();
      session.name = sessionObject.name;
      session.startTime = new Date(sessionObject.startTime);
      session.endTime = new Date(sessionObject.endTime);

      category.push(session);
      category.shift();
    });
  });
  return sessionData;
}

function uploadSessionStorage() {
  sessionStorage.setItem("sessionData", JSON.stringify(sessionData));
  sessionStorage.setItem("categoryData", JSON.stringify(categoryData));
  sessionStorage.setItem("id", JSON.stringify(id));
}

// redirect buttons

function mainRedirect() {
  uploadSessionStorage();
  window.location.href = "index.html";
}

function statsRedirect() {
  uploadSessionStorage();
  window.location.href = "stats.html";
}

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
