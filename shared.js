// fundamental structural stuff
class Session {
  constructor() {
    this.name = "Untitled Session";
    this.startTime;
    this.endTime;
    this.category;
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
    this.color = "hsl(" + cycleHSL((id - 1) * 207) + " 68 81)";
    this.id = id;
    if (!sessionData[this.id]) {
      sessionData[this.id] = [];
    }
    id++;
  }

  setName(name) {
    this.name = name;
  }

  addSubCategory(subcat) {
    subCategories.push(subcat);
  }
}

function cycleHSL(color) {
  return color % 360;
}

let id = JSON.parse(sessionStorage.getItem("id")) || 1;
let sessionData = initializeSessionData(
  JSON.parse(sessionStorage.getItem("sessionData"))
) || [[]];
console.log(JSON.parse(sessionStorage.getItem("categoryData")));
let categoryData =
  initializeCategoryData(JSON.parse(sessionStorage.getItem("categoryData"))) ||
  [];

const unsortedCat = {
  name: "Unsorted",
  color: "#EAEAEA",
};

function forEachCategory(categoryArray, forEachFunc) {
  for (let i = 0; i < categoryArray.length; i++) {
    forEachFunc(categoryArray[i]);
    if (categoryArray[i].subCategories.length !== 0) {
      forEachCategory(categoryArray[i].subCategories, forEachFunc);
    }
  }
}

function findCategory(categoryArray, categoryName) {
  for (let i = 0; i < categoryArray.length; i++) {
    if (categoryArray[i].name === categoryName) {
      return categoryArray[i];
    } else if (categoryArray[i].subCategories.length !== 0) {
      const result = findCategory(categoryArray[i].subCategories, categoryName);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}

// in the future change everything to id references
function findCategoryByID(categoryArray, categoryID) {
  for (let i = 0; i < categoryArray.length; i++) {
    if (categoryArray[i].id === categoryID) {
      return categoryArray[i];
    } else if (categoryArray[i].subCategories.length !== 0) {
      const result = findCategoryByID(
        categoryArray[i].subCategories,
        categoryID
      );
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}

function findParentCategory(category, categoryName) {
  for (let i = 0; i < category.subCategories.length; i++) {
    if (category.subCategories[i].name === categoryName) {
      return category;
    } else if (category.subCategories[i].subCategories.length !== 0) {
      const result = findParentCategory(
        category.subCategories[i],
        categoryName
      );
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}

function initializeSessionData(sessionData) {
  if (!sessionData) {
    return null;
  }

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

function initializeCategoryData(categoryArray) {
  if (!categoryArray) {
    return null;
  }

  for (let i = 0; i < categoryArray.length; i++) {
    const categoryObject = categoryArray[0];
    const category = new Category();
    category.name = categoryObject.name;
    category.subCategories = initializeCategoryData(
      categoryObject.subCategories
    );
    category.activity = categoryObject.activity;
    category.color = categoryObject.color;
    category.id = categoryObject.id;

    categoryArray.push(category);
    categoryArray.shift();
  }

  return categoryArray;
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

function calendarRedirect() {
  uploadSessionStorage();
  window.location.href = "calendar.html";
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
