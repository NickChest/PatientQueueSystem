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
      console.log(input_explode);

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
