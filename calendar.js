const yearbtn = document.querySelector(".year-btn");
const monthbtn = document.querySelector(".month-btn");
const daybtn = document.querySelector(".day-btn");
const timeline = document.querySelector(".timeline");

let chronologicalData = [];
let currentDate = [2024, 9, 11];

sessionData.forEach((catID, index) => {
  // insert sessions to the chronologicalData array
  const cat = categoryData.find((cat) => cat.id === index);

  catID.forEach((session) => {
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
      yearbtn.textContent = currentDate[0];
      event.target.parentElement.classList.add("hidden");
      printDay();
    };

    const yearList = document
      .querySelector(".year")
      .querySelector(".date-list");
    yearList.prepend(newbtn);
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
      monthbtn.textContent = currentDate[1];
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
      daybtn.textContent = currentDate[2];
      event.target.parentElement.classList.add("hidden");
      printDay();
    };

    dayList.appendChild(newbtn);
  }

  printDay();
}

function printDay() {
  const yearSessions = chronologicalData.find(
    (obj) => obj.year === currentDate[0]
  ).sessions;

  if (yearSessions.length > 0) {
    const daySessions = yearSessions[currentDate[1] - 1][currentDate[2] - 1];

    daySessions.forEach((session) => {
      const startHour = session.startTime.getHours();

      const hourLine = timeline.querySelectorAll(".hour-line")[startHour];

      const sessionBlock = document.createElement("div");
      sessionBlock.classList.add("timeline-session");

      hourLine.appendChild(sessionBlock);
    });
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
