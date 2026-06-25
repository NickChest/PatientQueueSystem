const textFieldElements = document.querySelectorAll("input:not([type='submit'])");
console.log(textFieldElements)
textFieldElements.forEach(textField => {
  textField.addEventListener("input", () => {
    document.querySelector(".message").textContent = "";
  })
})