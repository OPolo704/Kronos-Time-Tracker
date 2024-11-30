const yearbtn = document.querySelector(".year-btn");
const monthbtn = document.querySelector(".month-btn");
const daybtn = document.querySelector(".day-btn");
const dateIncreasebtn = document.querySelector(".date-increase");
const dateDecreasebtn = document.querySelector(".date-decrease");
const timeline = document.querySelector(".timeline");

let chronologicalData = [];
let currentDate = [2024, 9, 11];

sessionData.forEach((catSessions, index) => {
  // inserts sessions to the chronologicalData array
  let cat;
  if (index === 0) {
    cat = unsortedCat;
  } else {
    cat = categoryData.find((cat) => cat.id === index);
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
    // if there are no sessions makes it so that current year is still registered, not really useful since you're not gonna be changing the year with no sessions but to maintain consistency ig
    chronologicalData.push({
      year: currentDate[0],
      sessions: [],
    });
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
    const daySessions = yearSessions[currentDate[1] - 1][currentDate[2] - 1];

    daySessions.forEach((session) => {
      const hourLine =
        timeline.querySelectorAll(".hour-line")[session.startTime.getHours()];

      const sessionBlock = document.createElement("div");
      sessionBlock.classList.add("timeline-session");

      const minUnit = hourLine.offsetHeight / 60;

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
