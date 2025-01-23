const yearbtn = document.querySelector(".year-btn");
const monthbtn = document.querySelector(".month-btn");
const daybtn = document.querySelector(".day-btn");
const dateIncreasebtn = document.querySelector(".date-increase");
const dateDecreasebtn = document.querySelector(".date-decrease");
const timeline = document.querySelector(".timeline");
const zoomBox = document.querySelector(".zoom-box");
const zoomInbtn = document.querySelector(".zoom-in");
const zoomOutbtn = document.querySelector(".zoom-out");
const sessionEditPage = document.querySelector(".session-edit-page");
const sessionEdit = document.querySelector(".session-edit");
const sessionEditActivityList = document.querySelector(
  ".session-edit-activity-list"
);
const sessionEditbtn = document.querySelector(".fa-pen-to-square");
const sessionDeletebtn = document.querySelector(".fa-trash");
const sessionAddbtn = document.querySelector(".session-add-btn");

let chronologicalData = [];
let currentDate = [2024, 9, 11];
let zoomLevel = 0;
let daySessions;
let currentSessionIndex = "";

sessionData.forEach((catSessions, index) => {
  // inserts sessions to the chronologicalData array
  let cat;
  if (index === 0) {
    cat = unsortedCat;
  } else {
    cat = findCategoryByID(categoryData, index);
  }

  catSessions.forEach((session) => {
    const startTime = session.startTime;

    yearIndex = chronologicalData.findIndex((obj) => {
      return obj.year === startTime.getFullYear();
    });
    if (yearIndex === -1) {
      createYear(startTime.getFullYear());
      yearIndex = chronologicalData.length - 1;
    }

    session.category = cat;

    chronologicalData[yearIndex].sessions[startTime.getMonth()][
      startTime.getDate() - 1
    ].push(session);
  });
});

if (categoryData) {
  forEachCategory(categoryData, (cat) => {
    if (cat.activity) {
      const newbtn = document.createElement("button");
      newbtn.textContent = cat.name;
      newbtn.onclick = (event) => {
        const currentSession = daySessions[currentSessionIndex];
        const oldcat = currentSession.category;
        currentSession.category = findCategoryByID(categoryData, cat.id);
        sessionData[cat.id].push(currentSession);
        sessionData[oldcat.id].splice(
          sessionData[oldcat.id].indexOf(currentSession),
          1
        );
        printDay();
        sessionEdit.style.backgroundColor = cat.color;
        sessionEditActivityList.style.backgroundColor = cat.color;
        sessionEdit
          .querySelector(".session-edit-category")
          .querySelector("span").textContent = cat.name;
      };

      const colorDiv = document.createElement("div");
      colorDiv.style.backgroundColor = cat.color;
      newbtn.appendChild(colorDiv);

      sessionEditActivityList.appendChild(newbtn);
    }
  });
}

createDateList();

function createYear(year) {
  yearSessions = [];
  for (i = 0; i < 12; i++) {
    const month = [];
    for (k = 0; k < 31; k++) {
      month.push([]);
    }
    yearSessions.push(month);
  }

  const yearObject = {
    year: year,
    sessions: yearSessions,
  };
  chronologicalData.push(yearObject);
}

function createDateList() {
  const today = new Date();

  currentDate = [today.getFullYear(), today.getMonth() + 1, today.getDate()];

  if (chronologicalData.length === 0) {
    createYear(currentDate[0]);
  }

  yearbtn.textContent = currentDate[0];
  monthbtn.textContent = currentDate[1];
  daybtn.textContent = currentDate[2];

  chronologicalData.forEach((year) => {
    const newbtn = document.createElement("button");
    newbtn.textContent = year.year;
    newbtn.onclick = (event) => {
      currentDate[0] = +event.target.textContent;
      event.target.parentElement.classList.add("hidden");
      printDay();
    };

    const yearList = document
      .querySelector(".year")
      .querySelector(".date-list");
    yearList.append(newbtn);
  });

  const monthList = document
    .querySelector(".month")
    .querySelector(".date-list");
  const dayList = document.querySelector(".day").querySelector(".date-list");
  for (let i = 0; i < 12; i++) {
    const newbtn = document.createElement("button");
    newbtn.textContent = i + 1;
    newbtn.onclick = (event) => {
      currentDate[1] = +event.target.textContent;
      event.target.parentElement.classList.add("hidden");
      printDay();
    };

    monthList.appendChild(newbtn);
  }

  for (let i = 0; i < 31; i++) {
    const newbtn = document.createElement("button");
    newbtn.textContent = i + 1;
    newbtn.onclick = (event) => {
      currentDate[2] = +event.target.textContent;
      event.target.parentElement.classList.add("hidden");
      printDay();
    };

    dayList.appendChild(newbtn);
  }

  printDay();
}

function printDay() {
  yearbtn.textContent = currentDate[0];
  monthbtn.textContent = currentDate[1];
  daybtn.textContent = currentDate[2];

  for (let i = 0; i < timeline.children.length; i++) {
    while (timeline.children[i].children.length > 1) {
      timeline.children[i].removeChild(timeline.children[i].lastChild);
    }
  }

  const yearSessions = chronologicalData.find(
    (obj) => obj.year === currentDate[0]
  ).sessions;

  if (yearSessions.length > 0) {
    daySessions = yearSessions[currentDate[1] - 1][currentDate[2] - 1];
    let minUnit;
    let minLength;

    switch (zoomLevel) {
      case 0:
        minUnit = 1;
        minLength = 25;
        break;
      case 1:
        minUnit = 3;
        minLength = 9;
        break;
      case 2:
        minUnit = 5;
        minLength = 5;
        break;
    }

    daySessions.forEach((session, index) => {
      if (session.getDuration() > minLength * 60000) {
        const hourLine =
          timeline.querySelectorAll(".hour-line")[session.startTime.getHours()];
        const sessionBlock = document.createElement("div");
        sessionBlock.classList.add("timeline-session");

        sessionBlock.style.top =
          Math.floor(minUnit * session.startTime.getMinutes()) + "px";
        sessionBlock.style.height =
          Math.floor(minUnit * (session.getDuration() / 60000)) + "px";
        sessionBlock.style.backgroundColor = session.category.color;

        const top = document.createElement("div");
        top.classList.add("top");
        const category = document.createElement("div");
        category.textContent = session.category.name;
        const timeSpan = document.createElement("div");
        timeSpan.textContent =
          formatTime(session.startTime.getHours()) +
          ":" +
          formatTime(session.startTime.getMinutes()) +
          "-" +
          formatTime(session.endTime.getHours()) +
          ":" +
          formatTime(session.endTime.getMinutes());
        top.appendChild(category);
        top.appendChild(timeSpan);

        const bottom = document.createElement("div");
        bottom.classList.add("bottom");
        const name = document.createElement("div");
        name.textContent = session.name;
        const duration = document.createElement("div");
        duration.textContent =
          Math.floor(session.getDuration() / 3600000) +
          "h " +
          Math.floor((session.getDuration() / 60000) % 60) +
          "m";
        duration.style.whiteSpace = "nowrap";
        bottom.appendChild(name);
        bottom.appendChild(duration);

        sessionBlock.appendChild(top);
        sessionBlock.appendChild(bottom);

        hourLine.appendChild(sessionBlock);

        sessionBlock.onclick = () => {
          sessionEditPage.classList.remove("hidden");
          sessionEdit.style.backgroundColor = session.category.color;
          sessionEditActivityList.style.backgroundColor =
            session.category.color;

          document
            .querySelector(".session-edit-category")
            .querySelector("span").textContent = session.category.name;
          document.querySelector(".session-edit-startTime-hours").textContent =
            formatTime(session.startTime.getHours());
          document.querySelector(
            ".session-edit-startTime-minutes"
          ).textContent = formatTime(session.startTime.getMinutes());

          document.querySelector(".session-edit-endTime-hours").textContent =
            formatTime(session.endTime.getHours());
          document.querySelector(".session-edit-endTime-minutes").textContent =
            formatTime(session.endTime.getMinutes());
          document.querySelector(".session-edit-middle").textContent =
            session.name;
          document
            .querySelector(".session-edit-bottom")
            .querySelector("span").textContent = duration.textContent;

          currentSessionIndex = index;
        };
      }
    });
  }
}

function formatTime(time) {
  if (time < 10) {
    return "0" + time;
  } else {
    return time;
  }
}

yearbtn.onclick = (event) => {
  event.currentTarget.nextElementSibling.classList.toggle("hidden");
};

monthbtn.onclick = (event) => {
  event.currentTarget.nextElementSibling.classList.toggle("hidden");
};

daybtn.onclick = (event) => {
  event.currentTarget.nextElementSibling.classList.toggle("hidden");
};

dateIncreasebtn.onclick = () => {
  currentDate[2]++;
  if (currentDate[2] > 31) {
    currentDate[1]++;
    currentDate[2] = 1;
  }
  if (currentDate[1] > 12) {
    currentDate[0]++;
    currentDate[1] = 1;
    if (!chronologicalData.find((year) => year.year === currentDate[0])) {
      createYear(currentDate[0]);

      const newbtn = document.createElement("button");
      newbtn.textContent = currentDate[0];
      newbtn.onclick = (event) => {
        currentDate[0] = +event.target.textContent;
        event.target.parentElement.classList.add("hidden");
        printDay();
      };
      document
        .querySelector(".year")
        .querySelector(".date-list")
        .append(newbtn);
    }
  }
  printDay();
};

dateDecreasebtn.onclick = () => {
  currentDate[2]--;
  if (currentDate[2] < 1) {
    currentDate[1]--;
    currentDate[2] = 31;
  }
  if (currentDate[1] < 1) {
    currentDate[0]--;
    currentDate[1] = 12;
    if (!chronologicalData.find((year) => year.year === currentDate[0])) {
      createYear(currentDate[0]);

      const newbtn = document.createElement("button");
      newbtn.textContent = currentDate[0];
      newbtn.onclick = (event) => {
        currentDate[0] = +event.target.textContent;
        event.target.parentElement.classList.add("hidden");
        printDay();
      };
      document
        .querySelector(".year")
        .querySelector(".date-list")
        .prepend(newbtn);
    }
  }
  printDay();
};

zoomInbtn.onclick = () => {
  if (zoomLevel < 2) {
    zoomLevel++;
    updateZoomLevel();
    printDay();
  }
};

zoomOutbtn.onclick = () => {
  if (zoomLevel > 0) {
    zoomLevel--;
    updateZoomLevel();
    printDay();
  }
};

function updateZoomLevel() {
  const classtoadd = "zoomlevel" + zoomLevel;
  for (let i = 0; i < document.querySelectorAll(".hour-line").length; i++) {
    const hourline = document.querySelectorAll(".hour-line")[i];
    hourline.className = "hour-line";
    hourline.classList.add(classtoadd);
  }
}

// document.addEventListener("scroll", () => {
//   if (window.scrollY + window.innerHeight >= document.scrollHeight) {
//     zoomBox.classList.add("hidden");
//     console.log("yo");
//   } else {
//     zoomBox.classList.remove("hidden");
//     console.log("not yo");
//   }
// });
// do this at some point and add a bottom shadow from the bottom when fully scrolled like in the figma

sessionEditPage.onclick = (event) => {
  if (event.target === sessionEditPage) {
    sessionEditPage.classList.add("hidden");
    if (document.querySelector(".edit")) {
      toggleEdit();
    }
  }
};

sessionEditbtn.onclick = toggleEdit;

function toggleEdit() {
  const editCategory = document.querySelector(".session-edit-category");
  const editTime = document.querySelector(".session-edit-time");

  editCategory.classList.toggle("edit");
  editCategory.querySelector("i").classList.toggle("hidden");
  editTime.classList.toggle("edit");
  document.querySelector(".fa-pen-to-square").classList.toggle("edit");

  const middle = document.querySelector(".session-edit-middle");
  const startTime = document.querySelector(".session-edit-startTime");
  const endTime = document.querySelector(".session-edit-endTime");
  if (!middle.querySelector("textarea")) {
    const nameTextArea = document.createElement("textarea");
    nameTextArea.value = middle.textContent;
    nameTextArea.setAttribute("spellcheck", "false");
    middle.textContent = "";

    editCategory.onclick = () => {
      sessionEditActivityList.classList.toggle("hidden");
      editCategory.querySelector("i").classList.toggle("edit");
    };

    nameTextArea.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        toggleEdit();
      }
    });
    middle.appendChild(nameTextArea);

    startTime.onclick = () => {
      timeEdit(startTime, true);
    };

    endTime.onclick = () => {
      timeEdit(endTime, false);
    };

    function timeEdit(timeContainer, start) {
      const timedivs = timeContainer.querySelectorAll("div");
      for (let i = 0; i < timedivs.length; i++) {
        timedivs[i].textContent = "";
      }
      const inputh = document.createElement("input");
      const inputm = document.createElement("input");
      timeContainer.prepend(inputh);
      timeContainer.append(inputm);
      inputh.focus();
      inputh.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          inputh.blur();
        }
      });
      inputh.addEventListener("blur", () => {
        inputm.focus();
      });
      inputm.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          inputm.blur();
        }
      });
      inputm.addEventListener("blur", () => {
        timeContainer.querySelectorAll("div")[0].textContent = formatTime(
          +inputh.value
        );
        timeContainer.querySelectorAll("div")[1].textContent = formatTime(
          +inputm.value
        );
        if (start) {
          daySessions[currentSessionIndex].startTime.setHours(
            +inputh.value,
            +inputm.value
          );
        } else {
          daySessions[currentSessionIndex].endTime.setHours(
            +inputh.value,
            +inputm.value
          );
        }
        const timeinputs = timeContainer.querySelectorAll("input");
        for (let k = 0; k < timeinputs.length; k++) {
          timeContainer.removeChild(timeinputs[k]);
        }
      });
    }
  } else {
    middle.textContent = middle.querySelector("textarea").value;
    daySessions[currentSessionIndex].name = middle.textContent;
    editCategory.onclick = "";
    startTime.onclick = "";
    endTime.onclick = "";

    printDay();
  }
}

sessionDeletebtn.onclick = () => {
  const deletesesh = daySessions[currentSessionIndex];
  const cat = deletesesh.category;
  const deleteindex = sessionData[cat.id].findIndex((obj) => {
    obj === deletesesh;
  });
  daySessions.splice(currentSessionIndex, 1);
  sessionData[cat.id].splice(deleteindex, 1);

  sessionEditPage.classList.add("hidden");
  if (document.querySelector(".edit")) {
    toggleEdit();
  } else {
    printDay();
  }
};

sessionAddbtn.onclick = () => {
  const newSesh = new Session();
  newSesh.startTime = new Date();
  newSesh.endTime = new Date();
  newSesh.category = unsortedCat;
  sessionData[0].push(newSesh);
  daySessions.push(newSesh);
  currentSessionIndex = daySessions.length - 1;
  sessionEditPage.classList.remove("hidden");
  sessionEdit.style.backgroundColor = unsortedCat.color;
  sessionEditActivityList.style.backgroundColor = unsortedCat.color;

  document
    .querySelector(".session-edit-category")
    .querySelector("span").textContent = unsortedCat.name;
  document.querySelector(".session-edit-startTime-hours").textContent =
    formatTime(newSesh.startTime.getHours());
  document.querySelector(".session-edit-startTime-minutes").textContent =
    formatTime(newSesh.startTime.getMinutes());

  document.querySelector(".session-edit-endTime-hours").textContent =
    formatTime(newSesh.endTime.getHours());
  document.querySelector(".session-edit-endTime-minutes").textContent =
    formatTime(newSesh.endTime.getMinutes());
  document.querySelector(".session-edit-middle").textContent =
    "Untitled Session";
  document
    .querySelector(".session-edit-bottom")
    .querySelector("span").textContent = "0h 0m";
  toggleEdit();
};
