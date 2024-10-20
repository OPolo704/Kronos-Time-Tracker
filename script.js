class Session {
    constructor() {
        let name = "Untitled Session";
        let startTime;
        let endTime;
        let category = "Unsorted";
    }

    setName(name){
        this.name = name;
    }

    setStartTime(startTime){
        this.startTime = startTime;
    }

    setEndTime(endTime){
        this.endTime = endTime;
    }

    setCategory(category){
        this.category = category;
    }

    getDuration(){
        return this.endTime - this.startTime;
    }
}

class Category {
    constructor(name){
      this.name = name;
      let subCategories = [];
    }

    addSubCategory(subcat){
        subCategories.push(subcat);
    }
}

let sessionData = [];
let newSession = new Session();

startbtn = document.querySelector('.start-btn');

startbtn.onclick = () => {
    if(newSession.endTime || !newSession.startTime){
        startTimer();
        console.log('starting timer yay');
    } else {
        stopTimer();
        console.log('ending timer yay');
        console.log('duration length has been ' + newSession.getDuration() + ' ms');
    }
}

function startTimer(){
    newSession = new Session();

    newSession.setStartTime(new Date());
    newSession.setEndTime(undefined);
}

function stopTimer(){
    newSession.setEndTime(new Date());
    sessionData.push(newSession);

   // updateDrive(sessionData);   
}

function updateDrive(newData){
    const file = new Blob([JSON.stringify(newData)], {type: 'application/json'});
    const metadata = {
        'name': 'timelineData.json',    
        'mimeType' : 'application/json'
    }

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    formData.append('file', file);
    
    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        body: formData
    }).then((response) => response.json())
    .then((result) => {
        console.log("File uploaded successfully:", result);
    }).catch((error) => {
        console.error("Error uploading file:", error);
    });
}


// google api stuff below
let accessToken;

function initializeGapiClient() {
    const clientId = '464182844080-mm081mvubig8flsh4vk21t03k30b2ft3.apps.googleusercontent.com'; 

    const auth = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
            console.log("User signed in:", tokenResponse);
            accessToken = tokenResponse.access_token;    
        }
    });

    return auth;
}

function authenticateUser() {
    const auth = initializeGapiClient();
    auth.requestAccessToken();
}




