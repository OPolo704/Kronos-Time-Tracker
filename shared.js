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

let sessionData = [];
let categoryData = [];
let catUnsorted = new Category("Unsorted");

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
