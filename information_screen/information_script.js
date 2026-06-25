// const dateElement = document.getElementById("date");
const timeElement = document.getElementById("time");

// note, maybe just change this to php

// const months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// let formatted_date = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
// dateElement.textContent = formatted_date;
updateTime();

function updateTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let am_pm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  let formatted_time = `${hours}:${minutes}:${seconds} ${am_pm}`;

  timeElement.textContent = formatted_time;
}

setInterval(() => {
  updateTime();
}, 500);
