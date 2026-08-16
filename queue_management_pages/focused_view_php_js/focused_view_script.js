function setFocusedViewPageFunction() {
  const markedCompletedElement = document.getElementById("mark_completed");
  markedCompletedElement.addEventListener("click", () => {
    const record_id = document.querySelector(".patient_summary .record_id").value;
    const queue_id =
      document.querySelectorAll(".queue_id")[
        document.querySelectorAll(".queue_id").length - 1
      ].textContent;

    const popup_data = {
      heading: "Mark Completed",
      record_id: record_id,
      queue_id: queue_id,
      patient_id: document.querySelector(".patient_id").textContent,
      message: 'will be <span class="bolded">removed from the queue</span>.',
    };

    const confirmButtonElement = showPopup(popup_data, "confirm_popup");

    confirmButtonElement.addEventListener("click", () => {
      moveDatabaseMarkCompleted(record_id, queue_id, "focused_view");
      
      navDimmer.classList.add("loading");
    });
  });

  const removePatientElement = document.getElementById("remove_patient");
  removePatientElement.addEventListener("click", () => {
    const queue_id = document.querySelector(
      ".patient_summary > .queue_id",
    ).textContent;
    const record_id = document.querySelector(
      ".patient_summary > .record_id",
    ).value;
    const patient_id = document.querySelector("span.patient_id").textContent;

    const patient_info = {
      queue_id,
      record_id,
      patient_id,
    };

    removePatientFunction(patient_info, "focused_view");
  });

  callButtonElement = document.getElementById("call_button");
  callButtonElement.addEventListener("click", () => {
    const record_id = document.querySelector(".patient_summary .record_id").value;

    callButtonElement.disabled = true;
    callButtonElement.classList.add("disabled");

    flagDatabaseIsCalling(callButtonElement, record_id);
  });
}
