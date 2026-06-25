function addPatientFunction() {
  showPopup("", "add_patient_select");
}

function addPatientRecordSearch(search_query) {
  navDimmer.classList.add("loading");

  fetch("queue_management_pages/crud_php/search_patient_record.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(search_query),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        navDimmer.classList.remove("loading");

        // if query was successful
        if (data.found) {
          // and record/s was/were found
          if (!data.multiple) {
            // and if only one record found
            const popup_data = {
              record_id: data.patient_record.ID,
              patient_id: data.patient_record.patient_id,
              expected_queue_id: data.expected_id,
            };

            showPopup(popup_data, "add_patient_confirm");
          } else {
            // if multiple records match
            popup_data = data;
            popup_data["query"] = search_query;
            showPopup(popup_data, "multiple_records_select");
          }
        } else {
          navDimmer.classList.remove("loading");

          if (data.in_queue) {
            // if in queue already
            alert(
              `Existing Queued Patient:\n     Patient ID ${data.patient_id} (${data.patient_name}) is already in the queue.`,
            );
          } else {
            // no records found
            alert(
              `No Records Found:\n     No matching patient records were found for the entered information.`,
            );
          }
        }
      } else {
        navDimmer.classList.remove("loading");
        alert("Failed to search for records: " + data.error);
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}

function addDatabasePatient(record_id) {
  navDimmer.classList.add("loading");

  fetch("queue_management_pages/crud_php/add_patient_to_queue.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ record_id }),
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      navDimmer.classList.remove("loading");
      if (data.success) {
        const popup_data = {
          heading: "Add Patient Success",
          success_icon: true,
          message: `<span class="bolded">Patient ID ${data.patient_id} (${data.formatted_name})</span><br>was <span class="bolded">added to the queue</span><br>Queue ID: <span class="bolded">${data.queue_id}</span>`
        }

        showPopup(popup_data, "success_popup");
        
        // for now, users can only add patients on the patients management page
        // i mean there's no indication anyways that you can add a patient on the focused view unless there are no patients
        loadPage("queue_m_page")
      } else {
        alert("Failed to add patient to queue: " + data.error);
      }
    })
    .catch(error => {
      console.error("AJAX Error: ", error)
    })
}
