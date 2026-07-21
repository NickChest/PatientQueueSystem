const formElement = document.querySelector("form");
const inputElement = document.querySelector("input");
const messageElement = document.querySelector(".message");

if (formElement) {
  inputElement.addEventListener("input", () => {
    messageElement.textContent = "";
  });

  formElement.addEventListener("submit", (e) => {
    // remove surrounding whitespaces
    const input_value = inputElement.value.trim();

    // check if id has dash
    if (!input_value.includes("-")) {
      e.preventDefault();
      messageElement.textContent = "Please enter a valid Queue ID.";
    } else {
      const input_explode = input_value.split("-");

      // check if starting code is 2-3 chars long
      if (input_explode[0].length > 3) {
        e.preventDefault();
        messageElement.textContent = "Please enter a valid Queue ID.";
        return;
      }

      // check if number code is 3 characters long
      if (input_explode[1].length !== 3) {
        e.preventDefault();
        messageElement.textContent = "Please enter a valid Queue ID.";
        return;
      }

      // check if number code is even a number
      if (
        !(Number.isInteger(Number(input_explode[1])) && input_explode[1] !== "")
      ) {
        e.preventDefault();
        messageElement.textContent = "Please enter a valid Queue ID.";
      }
    }
  });
}

// ----- SHORT POLLING -----
// set to 10 seconds to prevent too many polling requests

if (document.querySelector(".waiting_main")) {
  const mainElement = document.querySelector("main");
  const placeElement = document.querySelector(".waiting_main span");
  const numberWaitingElement = document.querySelector(".waiting");

  const query_string = window.location.search;

  // get search parameters
  const url_params = new URLSearchParams(query_string);
  const queue_id = url_params.get("queue_id");

  const interval_id = setInterval(() => {
    fetch(`live_queue_update.php?queue_id=${encodeURIComponent(queue_id)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok/File now found");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          alert(`Error: ${data.error}`);
          return;
        }

        if (data.unqueued) {
          let message = "Thank you for using the Patient Queue System";
          let subtitle = "You can now close this tab. <br> Have a nice day!";
          if (data.reason === "removed") {
            message = "You were removed from the queue"
            subtitle = "Please visit the queue or department counter for more information. <br> Thank you."
          }
          clearInterval(interval_id);
          mainElement.innerHTML = `
            <div class="ending_message">${message}</div>
            <div class="ending_subtitle">${subtitle}</div>
          `;
          return;
        }

        placeElement.textContent = data.place;
        if (data.place !== 1) {
          numberWaitingElement.innerHTML = `There are <span class='bolded'>${data.waiting} people</span> in the queue.`;
        } else {
          numberWaitingElement.innerHTML = `<span class='bolded'>Please proceed to your assigned counter or department.</span> Thank you.`;
        }
      });
  }, 10000);
}
