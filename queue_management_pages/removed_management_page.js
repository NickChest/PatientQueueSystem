function addRestoreFunction() {
  const restoreButtonElements = document.querySelectorAll(".restore_button");

  restoreButtonElements.forEach((restoreButton) => {
    restoreButton.addEventListener("click", () => {
      restorePatientFunction(restoreButton.dataset);
    });
  });
}

function restorePatientFunction(button_dataset) {
  const popup_data = {
    heading: "Restore Record",
    message: 'will be <span class="bolded">restored to the queue</span>',
    queue_id: button_dataset.queueId,
    patient_id: button_dataset.patientId,
    record_id: button_dataset.id,
  };
  const confirmButtonElement = showPopup(popup_data, "confirm_popup");
  confirmButtonElement.addEventListener("click", () => {
    moveDatabaseRestorePatient(
      button_dataset.id,
      button_dataset.queueId,
      button_dataset.patientId,
    );
    navDimmer.classList.add("loading");
  });
}

function moveDatabaseRestorePatient(record_id, queue_id, patient_id) {
  fetch("queue_management_pages/crud_php/restore_removed.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      record_id,
      queue_id,
      patient_id,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        navDimmer.classList.remove("loading");
        const popup_data = {
          heading: "Patient Restored",
          message: `Queue ID <span class="bolded">${queue_id}</span> was <br><span class="bolded">restored to the queue.</span>`,
          success_icon: true,
        };

        loadPage("removed_pm_page");
        showPopup(popup_data, "success_popup");
      } else {
        alert("Failed to restore record: " + data.error);
        navDimmer.classList.remove("loading");
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}
