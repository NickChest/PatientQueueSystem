const timeElement = document.getElementById("time");

updateTime();

function updateTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let am_pm = hours >= 12 ? "PM" : "AM";

  // 1. Convert to 12-hour format (0 becomes 12)
  hours = hours % 12;
  hours = hours ? hours : 12; // If hours is 0, make it 12

  // 2. Add leading zero if less than 10
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  let formatted_time = `${hours}:${minutes}:${seconds} ${am_pm}`;

  timeElement.textContent = formatted_time;
}

document.querySelector(".confirm").addEventListener("click", () => {
  updateInfoScreen();
  setInterval(() => {
    updateInfoScreen();
  }, 3000);

  document.querySelector(".confirm").remove();
});

setInterval(() => {
  updateTime();
}, 500);

function updateInfoScreen() {
  fetch("information_get_queues.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok/File not found");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      displayQueues(data);
    });
}

const serviceInfoElements = document.querySelectorAll(".service_info_group");
// call_queue is an array with javascript objects {department: "", queue_id: ""}
let call_queue = [];
let is_audio_playing = false;

function displayQueues(data) {
  serviceInfoElements.forEach((serviceInfoElement) => {
    serviceInfoElement.innerHTML = "";
  });

  for (i = 0; i < data.length; i++) {
    if (data[i].is_calling) {
      // if the queue_id is not already in the call_queue
      if (
        !call_queue.some(
          (call_group) => call_group.queue_id === data[i].queue_id,
        )
      ) {
        call_queue.push({
          record_id: data[i].ID,
          department: data[i].department,
          queue_id: data[i].queue_id,
        });

        if (!is_audio_playing) {
          playCall();
        }
      }
    }

    serviceInfoElements[i].innerHTML = `
      <div class="service_name">${data[i].department}</div>
      <div class="now_serving">Now Serving:</div>
      <div class="queue_id">${data[i].queue_id}</div>
      <div class="num_waiting">${data[i].waiting} waiting</div>
    `;
  }
}

const chime_sound = new Audio("queue_chime.mp3");

function playCall() {
  if (call_queue.length === 0) {
    is_audio_playing = false;
    return;
  }

  is_audio_playing = true;

  const current_calling_patient = call_queue.shift();
  chime_sound.play();

  chime_sound.onended = () => {
    const speech = new SpeechSynthesisUtterance(
      `Now serving Queue ID ${current_calling_patient.queue_id}.. please proceed to ${current_calling_patient.department}.. thank you`,
    );
    window.speechSynthesis.speak(speech);

    speech.onend = () => {
      // plays the call twice, then removes
      playCall();
      removePatientCalling(current_calling_patient.record_id);
    };
  };
}

function removePatientCalling(record_id) {
  fetch("information_remove_is_calling.php", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      record_id,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok/File not found");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      if (data.success) {
        setTimeout(() => {
          playCall();
        }, 1500);

        call_queue.shift();
      }
    });
}
