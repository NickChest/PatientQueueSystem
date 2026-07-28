const textFieldElements = document.querySelectorAll("input:not([type='submit'])");
textFieldElements.forEach(textField => {
  textField.addEventListener("input", () => {
    document.querySelector(".message").textContent = "";
  })
})