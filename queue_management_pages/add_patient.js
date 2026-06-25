function addPatientFunction(patient_record_info, page) {
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
  
            navDimmer.classList.remove("loading");
            showPopup(popup_data, "add_patient_confirm");
          } else {
            // if multiple records match
            navDimmer.classList.remove("loading");
            popup_data = data;
            popup_data["query"] = search_query;
            showPopup(popup_data, "multiple_records_select");
          }
        } else {
          navDimmer.classList.remove("loading");
          alert(`No matching patient records were found for the entered information.`);
        }
      } else {
        alert("Failed to search for records: " + data.error);
        navDimmer.classList.remove("loading");
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}
