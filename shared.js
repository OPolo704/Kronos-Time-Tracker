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

let id = 1;
let sessionData = initializeSessionData(
  JSON.parse(localStorage.getItem("sessionData"))
) || [[]];
let categoryData =
  initializeCategoryData(JSON.parse(localStorage.getItem("categoryData"))) ||
  [];
let accessToken = localStorage.getItem("accessToken");
let lastSyncDate = new Date(localStorage.getItem("lastSyncDate"));

const unsortedCat = {
  name: "Unsorted",
  color: "#EAEAEA",
  id: 0,
};

if (accessToken === "null") {
  accessToken = null;
}

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

function initializeSessionData(data) {
  if (!data) {
    return null;
  }

  data.forEach((category) => {
    const len = category.length;
    for (let i = 0; i < len; i++) {
      const session = new Session();
      session.name = category[i].name;
      session.startTime = new Date(category[i].startTime);
      session.endTime = new Date(category[i].endTime);

      category.push(session);
      // category.shift(); this was originally the plan but for some reason it doesn't work as intended and using these slow ass console logs that don't give me accurate information makes it imposible to know why
    }
    category.splice(0, len);
  });
  return data;
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
  localStorage.setItem("sessionData", JSON.stringify(sessionData));
  localStorage.setItem("categoryData", JSON.stringify(categoryData));
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("lastSyncDate", lastSyncDate);
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
    name: "kronosData.json",
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

function getFileId(fileName) {
  fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id,name)`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.files && data.files.length > 0) {
        const fileId = data.files[0].id;
        console.log("File ID:", fileId);
        downloadDriveFile(fileId);
      } else {
        console.error("File not found");
        updateDrive([sessionData, categoryData, lastSyncDate]);
      }
    })
    .catch((error) => {
      console.error("Error fetching file ID:", error);
    });
}

function downloadDriveFile(fileId) {
  fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error downloading file: " + response.statusText);
      }
      return response.blob(); // Get the file as a Blob
    })
    .then((blob) => {
      // Convert the Blob to text or save it directly
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result; // File content as text
        const newData = JSON.parse(fileContent);
        const lastSyncDateDrive = new Date(newData[2]);
        console.log("Drive: " + lastSyncDateDrive.getTime());
        console.log("Session: " + lastSyncDate.getTime());
        if (lastSyncDateDrive.getTime() > lastSyncDate.getTime() + 1000) {
          sessionData = newData[0];
          categoryData = newData[1];
          lastSyncDate = lastSyncDateDrive;
        } else {
          lastSyncDate = new Date();
          updateDrive([sessionData, categoryData, lastSyncDate]);
        }
      };
      reader.readAsText(blob);
    })
    .catch((error) => {
      console.error(error);
    });
}
