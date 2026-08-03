function formatTimeMStoHHMMSS(miliseconds) {
  // code borrowed from stackoverflow
  // 1- Convert to seconds:
  let seconds = Math.floor(miliseconds / 1000);
  // 2- Extract hours:
  const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  // console.log(hours + ":" + minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
  formatted =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes) +
    ":" +
    (seconds < 10 ? "0" + seconds : seconds);

  return formatted;
}

let queue_interval;

function updateTimeElements(queue_time, call_time) {
  // clear interval before starting another one
  clearInterval(queue_interval);

  queueTimeElement = document.querySelector("#queue_time");
  callTimeElement = document.querySelector("#call_time");

  queue_time = new Date(queue_time);
  call_time = new Date(call_time);
  time_now = Date.now();

  difference_ms_queue = time_now - queue_time;
  difference_ms_call = time_now - call_time;

  queueTimeElement.textContent = formatTimeMStoHHMMSS(difference_ms_queue);
  callTimeElement.textContent = formatTimeMStoHHMMSS(difference_ms_call);

  queue_interval = setInterval(() => {
    time_now = Date.now();
    difference_ms_queue = time_now - queue_time;
    difference_ms_call = time_now - call_time;

    queueTimeElement.textContent = formatTimeMStoHHMMSS(difference_ms_queue);
    callTimeElement.textContent = formatTimeMStoHHMMSS(difference_ms_call);
  }, 1000);
}

const pageButtonElements = document.querySelectorAll(".page");
const articleElement = document.querySelector("article");
const headerTextElement = document.querySelector("#current_page_text");
const counterStaffSelectElement = document.querySelector(
  "#counter_staff_select",
);

let first_loaded_page = "queue_m_page";

// get url from browser
const query_string = window.location.search;

// get search parameters
let url_params = new URLSearchParams(query_string);

function clearURLSearchParams() {
  // 1. Grab just the base URL path (e.g., "/PatientQueueSystem/index.php")
  // This automatically ignores everything after the "?"
  const cleanUrl = window.location.pathname;

  // 2. Push the clean URL to the browser
  window.history.pushState(null, "", cleanUrl);

  // 3. Update url_params
  url_params = new URLSearchParams(query_string);
}

if (url_params.has("page")) {
  first_loaded_page = url_params.get("page");

  // if get page link isn't real, default to queue_m_page
  if (
    ![
      "queue_m_page",
      "completed_pm_page",
      "removed_pm_page",
      "focused_view",
    ].includes(first_loaded_page)
  ) {
    first_loaded_page = "queue_m_page";
    clearURLSearchParams();
  }

  pageButtonElements.forEach((page_button) => {
    page_button.id = null;
    if (page_button.dataset.page === first_loaded_page) {
      page_button.id = "selected";
    }
  });
}

// scrolling variables for completed and removed pages
let is_fetching = false;
let current_offset = 0;
let has_more_records = true;

let record_total = 0;

loadPage(first_loaded_page);

let current_page = first_loaded_page; // used for when user role is "Counter" and for search

pageButtonElements.forEach((page_button) => {
  page_button.addEventListener("click", () => {
    if (page_button.id === "selected") return;
    // don't reload page if already clicked
    // this will only be a problem if multiple people
    // are updating a single queue at once (which doesn't really make sense)

    for (const button of pageButtonElements) {
      button.id = null;
    }

    page_button.id = "selected";
    articleElement.className = "";

    let fetchedHTML = '</div class="error">Error reaasatrieving data.</div>';
    articleElement.innerHTML = `
        <div class="loading">
          <div class="throbber"><img src="global/img/throbber.gif" alt="Loading..."></div>
          <div class="load_text">Loading, please wait...</div>
        </div>
    `;

    const page = page_button.dataset.page;

    const new_url_params = new URLSearchParams(window.location.search);

    if (new_url_params.has("page")) {
      clearURLSearchParams();
    }

    // 3. Load the new page
    current_page = page;
    loadPage(page);
  });
});

function loadPage(page) {
  // reset global variables for scrolling
  is_fetching = false;
  current_offset = 0;
  has_more_records = true;
  record_total = 0;

  switch (page) {
    case "queue_m_page":
      document.title = "Queue | Patient Queue System";
      if (headerTextElement) {
        headerTextElement.textContent = "Queue";
      } else {
        counterStaffSelectElement.childNodes.forEach((optionElement) => {
          if (optionElement.value) {
            optionElement.textContent = optionElement.value + " Queue";
          }
        });
      }

      fetch("queue_management_pages/queue_management_page.php")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok/File not found");
          }

          return response.json();
        })
        .then((data) => {
          if (data.error) {
            articleElement.innerHTML = `</div class="error">Error: ${data.error}</div>`;
            return;
          }

          if (data.length === 0) {
            articleElement.innerHTML = `
                <div class="empty">There are currently no patients in the queue</div>
                <button class="add_patient button-default bg-green" id="add_patient">Add Patient</button>
              `;
            document
              .getElementById("add_patient")
              .addEventListener("click", () => {
                addPatientFunction();
              });
            return;
          }

          fetchedHTML = `
              <form action="" method="get" class="search" id="search_form">
                <fieldset>
                  <label for="search">Search by Patient ID/Queue ID/Name</label>
                  <input type="search" name="query" id="search" autocomplete="off"/>
                </fieldset>
              </form>
            `;
          fetchedHTML += `<div class="table queue">`;
          fetchedHTML += `<table>`;
          fetchedHTML += `
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Queue ID</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
            `;
          fetchedHTML += "<tbody>";
          data.forEach((patient) => {
            fetchedHTML += `<tr>`;
            fetchedHTML += `<td data-id="${patient.ID}">${patient.place}</td>`;
            fetchedHTML += `<td>${patient.queue_id}</td>`;
            fetchedHTML += `<td>${patient.patient_id}</td>`;
            fetchedHTML += `<td>${patient.patient_name}</td>`;
            fetchedHTML += `<td></td>`; // for actions (gets filled automatically by js function)
            fetchedHTML += `</tr>`;
          });
          fetchedHTML += "</tbody>";
          fetchedHTML += `</table>`;
          fetchedHTML += `</div>`;
          fetchedHTML += `<button class="add_patient button-default bg-green" id="add_patient">Add Patient</button>`;

          articleElement.innerHTML = fetchedHTML;
          setSearchFunction(page);
          const tbodyElement = document.querySelector("tbody");
          const rowElements = tbodyElement.children;

          document
            .getElementById("add_patient")
            .addEventListener("click", () => {
              addPatientFunction();
            });

          updatePlaces(rowElements);
          updateDatabasePlaces(page);

          setQueuePageFunctions();
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          articleElement.innerHTML = `<div class="error">Failed to fetch data</div>`;
        });
      break;
    case "completed_pm_page":
      document.title = "Completed Patients | Patient Queue System";
      if (headerTextElement) {
        headerTextElement.textContent = "— Completed Patients";
      } else {
        counterStaffSelectElement.childNodes.forEach((optionElement) => {
          if (optionElement.value) {
            optionElement.textContent =
              optionElement.value + " — Completed Patients";
          }
        });
      }

      fetch("queue_management_pages/completed_management_page.php")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok/File not found");
          }

          return response.json();
        })
        .then((data) => {
          if (data.error) {
            articleElement.innerHTML = `</div class="error">Error: ${data.error}</div>`;
            return;
          }

          if (data.length === 0) {
            articleElement.innerHTML = `
                <div class="empty">No patients have been marked as completed</div>
              `;
            return;
          }

          let fetchedHTML = `
              <form action="" method="get" class="search" id="search_form">
                <fieldset>
                  <label for="search">Search by Patient ID/Queue ID/Name</label>
                  <input type="search" name="query" id="search" autocomplete="off"/>
                </fieldset>
                <fieldset>`;

          if (data[0].marked_by) {
            // give date selector if admin
            fetchedHTML += `
              <label for="date">Date Completed</label>
              <input type="date" name="date" id="date" />
            `;
          }

          fetchedHTML += `
                </fieldset>
              </form>
              <div class="table completed">
                <table>
                  <thead>
                    <tr>
                      <th>Queue ID</th>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Time Marked Completed</th>`;

          if (data[0].marked_by) {
            fetchedHTML += "<th>Marked by</th>";
          }
          fetchedHTML += `
                    </tr>
                  </thead>
                  <tbody>`;
          fetchedHTML += generateCompletedRemovedTables(page, data);
          fetchedHTML += `
                  </tbody>
                </table>
              </div>
            `;

          articleElement.innerHTML = fetchedHTML;
          setSearchFunction(page);
          setLoadMoreAtScroll();
        });
      break;
    case "removed_pm_page":
      document.title = "Removed Patients | Patient Queue System";
      if (headerTextElement) {
        headerTextElement.textContent = "— Removed Patients";
      } else {
        counterStaffSelectElement.childNodes.forEach((optionElement) => {
          if (optionElement.value) {
            optionElement.textContent =
              optionElement.value + " — Removed Patients";
          }
        });
      }

      fetch("queue_management_pages/removed_management_page.php")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok/File not found");
          }

          return response.json();
        })
        .then((data) => {
          if (data.error) {
            articleElement.innerHTML = `<div class="error">Error: ${data.error}</div>`;
            return;
          }

          if (data.length === 0) {
            articleElement.innerHTML = `
              <div class="empty">No patients have been removed from the queue</div>
              `;
            return;
          }

          fetchedHTML = `
              <form action="" method="get" class="search" id="search_form">
                <fieldset>
                  <label for="search">Search by Patient ID/Queue ID/Name</label>
                  <input type="search" name="query" id="search" autocomplete="off"/>
                </fieldset>
                <fieldset>
                  <label for="reason">Reason</label>
                  <select name="reason" id="reason">
                    <option value="all" selected>Any Reason</option>`;

          let reasons_array = [];
          data.forEach((removed_patient) => {
            if (!reasons_array.includes(removed_patient.reason)) {
              fetchedHTML += `<option value="${removed_patient.reason}">${removed_patient.reason}</option>`;
              reasons_array.push(removed_patient.reason);
            } else return;
          });

          fetchedHTML += `</select>
                </fieldset>
              </form>
            `;
          fetchedHTML += `<div class="table removed">`;
          fetchedHTML += `<table>`;
          fetchedHTML += `
              <thead>
                <tr>
                  <th>Queue ID</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Reason</th>
                  <th>Time Removed</th>`;
          if (data[0].removed_by) {
            // if admin, see who removed the record
            fetchedHTML += "<th>Removed by</th>";
          }
          fetchedHTML += `
                  <th>Actions</th>
                </tr>
              </thead>
            `;
          fetchedHTML += `<tbody>`;
          fetchedHTML += generateCompletedRemovedTables(page, data);
          fetchedHTML += `</tbody>`;
          fetchedHTML += `</table>`;
          fetchedHTML += `</div>`;

          articleElement.innerHTML = fetchedHTML;
          setSearchFunction(page);
          addRestoreFunction();
          setLoadMoreAtScroll();
        });

      break;
    case "focused_view":
      document.title = "Focused View | Patient Queue System";
      if (headerTextElement) {
        headerTextElement.textContent = "Queue";
      } else {
        counterStaffSelectElement.childNodes.forEach((optionElement) => {
          if (optionElement.value) {
            optionElement.textContent = optionElement.value + " Queue";
          }
        });
      }

      fetch("queue_management_pages/queue_management_page.php")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok/File not found");
          }

          return response.json();
        })
        .then((data) => {
          articleElement.className = "queue_group";
          if (data.error) {
            articleElement.innerHTML = `</div class="error">Error: ${data.error}</div>`;
            return;
          }

          if (data.length === 0) {
            articleElement.innerHTML = `
                <div class="empty">There are currently no patients in the queue</div>
                <!-- <button class="add_patient button-default bg-green" id="add_patient">Add Patient</button> -->
              `;
            return;
          }

          fetchedHTML = `<div class="upcoming_patients">`;
          fetchedHTML += `<div class="heading">Upcoming Patients:</div>`;
          fetchedHTML += `<div class="patients_list">`;
          data.forEach((upcoming_patient) => {
            if (upcoming_patient === data[0]) return;
            fetchedHTML += `
                <div class="patient_group">
                  <input type="hidden" class="place" value="${upcoming_patient.place}">
                  <input type="hidden" class="record_id" value="${upcoming_patient.ID}">
                  <div class="queue_id">${upcoming_patient.queue_id}</div>
                  <div class="name">${upcoming_patient.patient_name}</div>
                </div>
              `;
          });
          fetchedHTML += "</div>";
          fetchedHTML += "</div>";
          fetchedHTML += `
            <div class="patient_queue_info">
              <div class="patient_summary">
                <input type="hidden" class="place" value="${data[0].place}">
                <input type="hidden" class="record_id" value="${data[0].ID}">
                <div class="now_serving">Now Serving:</div>
                <div class="queue_id">${data[0].queue_id}</div>
                <div class="name">${data[0].patient_name}</div>
                <div class="record_link">(<span data-patient-id="${data[0].patient_id}">Patient ID <span class="patient_id">${data[0].patient_id}</span></span>)</div>
              </div>
              <div class="wait_summary">
                <div class="queue_time_elapsed">
                  Time since first entering queue: <span id="queue_time"><span>
                </div>
                <div class="call_time_elapsed">Time since first call: <span id="call_time"><span></div>
              </div>
              <div class="buttons">
                <button class="call button-default bg-blue" id="call_button">
                  <div class="call_icon icon">
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.137 3.945C12.493 3.571 12.095 2.875 12.096 2.125V2.122C12.097 0.95 11.158 0 10 0C8.842 0 7.903 0.95 7.903 2.122V2.125C7.904 2.876 7.507 3.571 6.862 3.945C2.195 6.657 4.877 15.66 0 17.251V19H20V17.251C15.123 15.66 17.805 6.657 13.137 3.945ZM10 1C10.552 1 11 1.449 11 2C11 2.552 10.552 3 10 3C9.448 3 9 2.552 9 2C9 1.449 9.448 1 10 1ZM13 21C13 22.598 11.608 24 10.029 24C8.45 24 7 22.598 7 21H13Z" fill="white"/>
                    </svg>
                  </div>
                </button>
                <button class="mark_completed button-default bg-green" id="mark_completed">
                  <div class="mark_com_icon icon">
                    <svg width="24" height="17" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.2023 0.460614C23.4972 0.755927 23.6629 1.15624 23.6629 1.57361C23.6629 1.99099 23.4972 2.3913 23.2023 2.68661L9.55229 16.3366C9.25697 16.6316 8.85666 16.7972 8.43929 16.7972C8.02191 16.7972 7.6216 16.6316 7.32629 16.3366L0.501287 9.51161C0.346544 9.36742 0.22243 9.19354 0.136347 9.00034C0.0502636 8.80715 0.00397636 8.59859 0.000245117 8.38711C-0.00348613 8.17563 0.0354151 7.96557 0.114629 7.76946C0.193843 7.57334 0.311747 7.39519 0.461306 7.24563C0.610866 7.09607 0.789017 6.97817 0.985132 6.89896C1.18125 6.81974 1.39131 6.78084 1.60278 6.78457C1.81426 6.7883 2.02282 6.83459 2.21602 6.92067C2.40922 7.00676 2.5831 7.13087 2.72729 7.28561L8.43929 12.9976L20.9763 0.460614C21.2716 0.165668 21.6719 0 22.0893 0C22.5067 0 22.907 0.165668 23.2023 0.460614Z" fill="white"/>
                    </svg>
                  </div>
                </button>
                <button class="remove_patient button-default bg-red" id="remove_patient">
                  <div class="rem_icon icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8625 11.6065L20.7265 4.74255C21.0305 4.45455 21.2065 4.05455 21.2065 3.60655C21.2061 3.28977 21.1119 2.98022 20.9358 2.71689C20.7598 2.45355 20.5097 2.24821 20.2171 2.12674C19.9246 2.00527 19.6026 1.9731 19.2918 2.03428C18.981 2.09546 18.6952 2.24726 18.4705 2.47055L11.6065 9.35055L4.74255 2.47055C4.44126 2.16926 4.03263 2 3.60655 2C3.18046 2 2.77183 2.16926 2.47055 2.47055C2.16926 2.77183 2 3.18046 2 3.60655C2 4.03263 2.16926 4.44126 2.47055 4.74255L9.35055 11.6065L2.48655 18.4705C2.18255 18.7585 2.00655 19.1585 2.00655 19.6065C2.007 19.9233 2.1012 20.2329 2.27727 20.4962C2.45334 20.7595 2.7034 20.9649 2.99596 21.0864C3.28852 21.2078 3.61048 21.24 3.92129 21.1788C4.2321 21.1176 4.51785 20.9658 4.74255 20.7425L11.6065 13.8625L18.4705 20.7265C18.7585 21.0305 19.1585 21.2065 19.6065 21.2065C19.9233 21.2061 20.2329 21.1119 20.4962 20.9358C20.7595 20.7598 20.9649 20.5097 21.0864 20.2171C21.2078 19.9246 21.24 19.6026 21.1788 19.2918C21.1176 18.981 20.9658 18.6952 20.7425 18.4705L13.8625 11.6065Z" fill="white"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
            `;

          articleElement.innerHTML = fetchedHTML;

          updateTimeElements(
            data[0].added_time_and_date,
            data[0].called_time_and_date,
          );

          const upcomingPatientsListElement =
            document.querySelector(".patients_list");

          if (upcomingPatientsListElement.childNodes.length === 0) {
            upcomingPatientsListElement.innerHTML = `
            <div class="empty">No upcoming patients</div>
            `;
          }

          document
            .querySelector(".record_link span")
            .addEventListener("click", (e) => {
              viewRecord(
                e.currentTarget.dataset.patientId,
                "patient_id",
                false,
              );
            });

          updateDatabasePlaces(page);

          setFocusedViewPageFunction();
        });
      break;
  }
}

function showPopup(popup_data, popup_type) {
  navDimmer.classList.add("open");
  navDimmer.classList.add("popup");

  // returns the confirm button so there's no need to query to add an event listener
  let confirmButtonElement = "";
  let popupHTML = "";
  switch (popup_type) {
    case "confirm_popup":
      popupHTML = `
        <div class="popup" id="confirm_popup">
          <div class="popup_heading">${popup_data["heading"]}</div>
          <div class="queue_id emphasis">${popup_data["queue_id"]}</div>
          <div class="record_link" data-id="${popup_data["patient_id"]}">(<span>Patient ID ${popup_data["patient_id"]}</span>)</div>
          <div class="message">${popup_data["message"]}</div>
          <div class="options">`;

      if (!popup_data["options"]) {
        popupHTML += `
          <button class="button-default bg-blue" id="confirm_button" data-id="${popup_data["record_id"]}">Confirm</button>
          <button class="button-invert bg-blue" id="cancel_popup">Cancel</button>
        `;
      } else {
        popupHTML += `
          <button class="button-default bg-blue" id="confirm_button" data-id="${popup_data["record_id"]}">${popup_data["options"]["confirm"]}</button>
          <button class="button-invert bg-blue" id="cancel_popup">${popup_data["options"]["cancel"]}</button>
        `;
      }

      popupHTML += `
          </div>
        </div>
      `;

      popupContainerElement.innerHTML = popupHTML;

      confirmButtonElement = document.getElementById("confirm_button");
      document.getElementById("cancel_popup").addEventListener("click", () => {
        resetPopupDimmer();
      });
      document.querySelector(".record_link").addEventListener("click", () => {
        viewRecord(popup_data["patient_id"], "patient_id", false);
      });
      break;
    case "success_popup":
      popupHTML = `
        <div class="popup status">
          <div class="popup_heading">${popup_data["heading"]}</div>
        `;

      if (popup_data["success_icon"]) {
        popupHTML += `<img src="global/img/success_check.png" alt="check">`;
      }

      popupHTML += `<div class="message">${popup_data["message"]}</div>
          <div class="options">
            <button class="button-default bg-blue" onclick="resetPopupDimmer()">Okay</button>
          </div>
        </div>
      `;

      popupContainerElement.innerHTML = popupHTML;
      break;
    case "remove_patient_reason":
      popupContainerElement.innerHTML = `
        <div class="popup reason">
          <div class="popup_heading">Select Removal Reason</div>
          <form id="reason_form">
            <fieldset>
              <div>
                <input type="radio" name="reason_select" id="disappear" value="Did not appear after calling" required>
                <label for="disappear">Did not appear after calling</label>
              </div>
              <div>
                <input type="radio" name="reason_select" id="wrong" value="Wrong patient record selected">
                <label for="wrong">Wrong patient record selected</label>
              </div>
              <div>
                <input type="radio" name="reason_select" id="cutoff" value="Cutoff">
                <label for="cutoff">Cutoff</label>
              </div>
              <div class="other">
                <input type="radio" name="reason_select" id="other" value="other">
                <label for="other">Other:</label>
                <input type="text" name="other_textbox" disabled autocomplete="off">
              </div>
            </fieldset>
            <fieldset>
              <button class="button-default bg-blue" id="next">Next</button>
            </fieldset>
          </form>
          <div id="back" onclick="resetPopupDimmer()">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27.1414 41.7277L25.0602 43.809C24.1789 44.6902 22.7539 44.6902 21.882 43.809L3.65703 25.5934C2.77578 24.7121 2.77578 23.2871 3.65703 22.4152L21.882 4.19023C22.7633 3.30898 24.1883 3.30898 25.0602 4.19023L27.1414 6.27148C28.032 7.16211 28.0133 8.61523 27.1039 9.48711L15.807 20.2496H42.7508C43.9977 20.2496 45.0008 21.2527 45.0008 22.4996V25.4996C45.0008 26.7465 43.9977 27.7496 42.7508 27.7496H15.807L27.1039 38.5121C28.0227 39.384 28.0414 40.8371 27.1414 41.7277Z" fill="black" />
            </svg>
            Back
          </div>
        </div>
      `;

      const radioButtonElements = document.querySelectorAll(
        "input[name='reason_select']",
      );
      const textInputElement = document.querySelector(
        "input[name='other_textbox']",
      );
      radioButtonElements.forEach((radioButton) => {
        radioButton.addEventListener("change", () => {
          if (radioButton.value === "other") {
            textInputElement.disabled = false;
            textInputElement.focus();
            textInputElement.required = true;
          } else {
            textInputElement.value = "";
            textInputElement.disabled = true;
            textInputElement.required = false;
          }
        });
      });

      // submit form as the confirmation to make things easier
      confirmButtonElement = document.getElementById("reason_form");
      break;
    case "add_patient_select":
      popupContainerElement.innerHTML = `
        <div class='popup add_patient choose'>
          <div class='popup_heading'>Add Patient</div>
          <div class='message'>How would you like to add a patient?</div>
          <div class='options'>
            <button class='button-default bg-blue' id="scan_id">Scan ID</button>
            <button class='button-invert bg-blue' id="manual_entry">Manual Entry</button>
          </div>
          <div id='back' onclick='resetPopupDimmer()'>
            <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M27.1414 41.7277L25.0602 43.809C24.1789 44.6902 22.7539 44.6902 21.882 43.809L3.65703 25.5934C2.77578 24.7121 2.77578 23.2871 3.65703 22.4152L21.882 4.19023C22.7633 3.30898 24.1883 3.30898 25.0602 4.19023L27.1414 6.27148C28.032 7.16211 28.0133 8.61523 27.1039 9.48711L15.807 20.2496H42.7508C43.9977 20.2496 45.0008 21.2527 45.0008 22.4996V25.4996C45.0008 26.7465 43.9977 27.7496 42.7508 27.7496H15.807L27.1039 38.5121C28.0227 39.384 28.0414 40.8371 27.1414 41.7277Z' fill='black' />
            </svg>
            Back
          </div>
        </div>
      `;
      const scanIDButtonElement = document.getElementById("scan_id");
      const manualEntryButtonElement = document.getElementById("manual_entry");

      scanIDButtonElement.addEventListener("click", () => {
        alert("TODO: OCR SCANNING");
        resetPopupDimmer();
      });
      manualEntryButtonElement.addEventListener("click", () => {
        showPopup("", "add_patient_manual_entry_patient_id");
      });
      break;
    case "add_patient_manual_entry_patient_id":
      popupContainerElement.innerHTML = `
        <div class="popup search patient_id">
          <div class="popup_heading">Add Patient / Manual Entry</div>
          <form id="patient_id_search_form">
            <fieldset>
              <div>
              <label for="patient_id">Patient ID</label>
                <input 
                  type="text" 
                  inputmode="numeric" 
                  oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                  name="patient_id"
                  id="patient_id"
                  autocomplete="off"
                  required>
              </div>
            </fieldset>
            <div id="option_name_and_birthdate" title="Search using name and birthdate">Search using name and birthdate</div>
            <fieldset>
              <button class="button-default bg-blue" id="search_records">Search Records</button>
            </fieldset>
          </form>
          <div id="back">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27.1414 41.7277L25.0602 43.809C24.1789 44.6902 22.7539 44.6902 21.882 43.809L3.65703 25.5934C2.77578 24.7121 2.77578 23.2871 3.65703 22.4152L21.882 4.19023C22.7633 3.30898 24.1883 3.30898 25.0602 4.19023L27.1414 6.27148C28.032 7.16211 28.0133 8.61523 27.1039 9.48711L15.807 20.2496H42.7508C43.9977 20.2496 45.0008 21.2527 45.0008 22.4996V25.4996C45.0008 26.7465 43.9977 27.7496 42.7508 27.7496H15.807L27.1039 38.5121C28.0227 39.384 28.0414 40.8371 27.1414 41.7277Z" fill="black" />
            </svg>
            Back
          </div>
        </div>
      `;

      const inputElement = document.getElementById("patient_id");
      inputElement.focus();

      document.getElementById("back").addEventListener("click", () => {
        showPopup("", "add_patient_select");
      });
      document
        .getElementById("option_name_and_birthdate")
        .addEventListener("click", () => {
          showPopup("", "add_patient_manual_entry_patient_details");
        });
      document
        .getElementById("patient_id_search_form")
        .addEventListener("submit", (e) => {
          e.preventDefault();

          const patient_id = inputElement.value;
          addPatientRecordSearch({ patient_id });
        });
      break;
    case "add_patient_manual_entry_patient_details":
      popupContainerElement.innerHTML = `
        <div class='popup search patient_details'>
          <div class='popup_heading'>Add Patient / Manual Entry</div>
          <form id='patient_details_search_form'>
            <fieldset>
              <div>
                <label for='first_name'>First Name</label>
                <input type='text' name='first_name' id='first_name' autocomplete='off'>
              </div>
            </fieldset>
            <fieldset>
              <div>
                <label for='last_name'>Last Name<span class='required'>*</span></label>
                <input type='text' name='last_name' id='last_name' autocomplete='off' required>
              </div>
            </fieldset>
            <fieldset>
              <div>
                <label for='birthdate'>Birthdate<span class='required'>*</span></label>
                <input type='date' name='birthdate' id='birthdate' required>
              </div>
            </fieldset>
            <fieldset>
              <button class='button-default bg-blue' id='search_records'>Search Records</button>
            </fieldset>
          </form>
          <div id='back'>
            <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M27.1414 41.7277L25.0602 43.809C24.1789 44.6902 22.7539 44.6902 21.882 43.809L3.65703 25.5934C2.77578 24.7121 2.77578 23.2871 3.65703 22.4152L21.882 4.19023C22.7633 3.30898 24.1883 3.30898 25.0602 4.19023L27.1414 6.27148C28.032 7.16211 28.0133 8.61523 27.1039 9.48711L15.807 20.2496H42.7508C43.9977 20.2496 45.0008 21.2527 45.0008 22.4996V25.4996C45.0008 26.7465 43.9977 27.7496 42.7508 27.7496H15.807L27.1039 38.5121C28.0227 39.384 28.0414 40.8371 27.1414 41.7277Z' fill='black' />
            </svg>
            Back
          </div>
        </div>
      `;

      document.getElementById("back").addEventListener("click", () => {
        showPopup("", "add_patient_manual_entry_patient_id");
      });

      document
        .getElementById("patient_details_search_form")
        .addEventListener("submit", (e) => {
          e.preventDefault();

          const first_name = document.getElementById("first_name").value;
          const last_name = document.getElementById("last_name").value;
          const birthdate = document.getElementById("birthdate").value;

          addPatientRecordSearch({
            first_name,
            last_name,
            birthdate,
          });
        });
      break;
    case "multiple_records_select":
      console.log(popup_data);
      let formatted_query = popup_data.query["last_name"].toUpperCase();
      if (popup_data.query["first_name"]) {
        formatted_query += `, ${popup_data.query["first_name"].toUpperCase()}`;
      }

      const formatted_birthdate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(popup_data.query["birthdate"]));

      let recordPopupHTML = `
          <div class='popup multiple_records'>
            <div class='popup_heading'>Add Patient / Found Records</div>
            <div class='message'>Matching records for <span class='bolded'>${formatted_query}</span> with birthdate <span class='bolded'>${formatted_birthdate}</span>:</div>
              <div class='records_container'>`;

      index = 0;

      popup_data.patient_records.forEach((record) => {
        recordPopupHTML += `
          <div class='record'>
            <div class='info_summary'>
              <div class='info'>
                <span>Patient ID:</span>
                <span>${record.patient_id}</span>
              </div>
              <div class='info'>
                <span>Name:</span>
                ${record.patient_last_name}, ${record.patient_first_name} ${record.patient_middle_name ? record.patient_middle_name : ""}
              </div>
              <div class='info'>
                <span>Address:</span>
                ${record.patient_address}
              </div>
              <div class='info'>
                <span>Contact No.</span>
                ${record.patient_contact_number}
              </div>
            </div>
            <div class='add_patient'>
              <button class='button-default bg-blue select_record' data-index='${index}'>Select Record</button>
            </div>                  
          </div>
        `;

        index++;
      });

      recordPopupHTML += `
              </div>
            <div id='back' class="multi_record_back">
              <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M27.1414 41.7277L25.0602 43.809C24.1789 44.6902 22.7539 44.6902 21.882 43.809L3.65703 25.5934C2.77578 24.7121 2.77578 23.2871 3.65703 22.4152L21.882 4.19023C22.7633 3.30898 24.1883 3.30898 25.0602 4.19023L27.1414 6.27148C28.032 7.16211 28.0133 8.61523 27.1039 9.48711L15.807 20.2496H42.7508C43.9977 20.2496 45.0008 21.2527 45.0008 22.4996V25.4996C45.0008 26.7465 43.9977 27.7496 42.7508 27.7496H15.807L27.1039 38.5121C28.0227 39.384 28.0414 40.8371 27.1414 41.7277Z' fill='black' />
              </svg>
              Back
            </div>
          </div>
      `;

      popupContainerElement.insertAdjacentHTML("beforeend", recordPopupHTML);

      // 3. Attach your back button logic
      document
        .querySelector(".multi_record_back")
        .addEventListener("click", () => {
          document.querySelector(
            ".popup.search.patient_details",
          ).style.display = "block";
          document.querySelector(".popup.multiple_records").remove();
        });

      const selectRecordElements = document.querySelectorAll(".select_record");

      selectRecordElements.forEach((recordElement) => {
        recordElement.addEventListener("click", () => {
          addPatientRecordSearch({
            patient_id:
              popup_data.patient_records[recordElement.dataset.index]
                .patient_id,
          });
        });
      });

      break;
    case "add_patient_confirm":
      popupContainerElement.innerHTML = `
        <div class="popup add_patient_confirm">
          <div class="popup_heading">Confirm Patient</div>
          <div class="message"><span class="record_link" id="view_record" data-id="${popup_data["record_id"]}" title="View Record Details for Patient ID ${popup_data["patient_id"]}">Patient ID ${popup_data["patient_id"]}</span> will be <br><span class="bolded">added to the queue</span> as <span class="bolded">${popup_data["expected_queue_id"]}</span></div>
          <div class="options">
            <button class="button-default bg-blue" id="confirm_button" data-id="${popup_data["record_id"]}">Proceed</button>
            <button class="button-invert bg-blue" id="cancel_popup" onclick="resetPopupDimmer()">Cancel</button>
          </div>
        </div>
      `;

      const recordLinkElement =
        popupContainerElement.querySelector(".record_link");

      if (recordLinkElement) {
        recordLinkElement.addEventListener("click", () => {
          // NOTE THIS IS THE RECORD ID USED IN THE PATIENT RECORDS TABLE
          viewRecord(popup_data["record_id"], "patient_record_id", true);
        });
      }

      document
        .querySelector("#confirm_button")
        .addEventListener("click", () => {
          addDatabasePatient(popup_data["record_id"]);
        });
      break;
    case "expanded_patient_info":
      // asked gemini to fixed this because i am so tired... it is 12:02 am
      let viewRecordHTML = `
        <div class='popup view_record'>
          <div class='popup_heading'>Patient Information</div>
          <div class='record_information'>
              <div class='record_info_group'>
                <div class='label'>Patient ID</div>
                <div class='information bolded'>${popup_data.patient_id}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>Last Name</div>
                <div class='information'>${popup_data.patient_last_name}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>First Name</div>
                <div class='information'>${popup_data.patient_first_name}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>Middle Name</div>
                <div class='information'>${popup_data.patient_middle_name}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>Birthday</div>
                <div class='information'>${popup_data.patient_birthday}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>Sex</div>
                <div class='information'>${popup_data.patient_sex}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>Address</div>
                <div class='information'>${popup_data.patient_address}</div>
              </div>
              <div class='record_info_group'>
                <div class='label'>Contact No.</div>
                <div class='information'>${popup_data.patient_contact_number}</div>
              </div>
          </div>
          <div id='back' class="view_record_back">
            <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M27.1414 41.7277L25.0602 43.809C24.1789 44.6902 22.7539 44.6902 21.882 43.809L3.65703 25.5934C2.77578 24.7121 2.77578 23.2871 3.65703 22.4152L21.882 4.19023C22.7633 3.30898 24.1883 3.30898 25.0602 4.19023L27.1414 6.27148C28.032 7.16211 28.0133 8.61523 27.1039 9.48711L15.807 20.2496H42.7508C43.9977 20.2496 45.0008 21.2527 45.0008 22.4996V25.4996C45.0008 26.7465 43.9977 27.7496 42.7508 27.7496H15.807L27.1039 38.5121C28.0227 39.384 28.0414 40.8371 27.1414 41.7277Z' fill='black' />
            </svg>
            Back
          </div>`;

      if (popup_data.is_add_patient) {
        viewRecordHTML += `<button class="button-default bg-green" id="add_patient_to_queue" data-id="${popup_data.ID}">Add Patient to Queue</button>`;
      }
      viewRecordHTML += `</div>`;

      const confirmPopupElement = document.querySelector("#confirm_popup");

      // 2. Append the new HTML safely
      if (popup_data.is_add_patient || confirmPopupElement) {
        if (popup_data.is_add_patient) {
          document.querySelector(".popup.add_patient_confirm").style.display =
            "none";
        } else {
          confirmPopupElement.style.display = "none";
        }

        popupContainerElement.insertAdjacentHTML("beforeend", viewRecordHTML);
      } else {
        popupContainerElement.innerHTML = viewRecordHTML;
      }

      // 3. Attach your back button logic
      document
        .querySelector(".view_record_back")
        .addEventListener("click", () => {
          if (popup_data.is_add_patient || confirmPopupElement) {
            if (popup_data.is_add_patient) {
              document.querySelector(".add_patient_confirm").style.display =
                "block";
            } else {
              confirmPopupElement.style.display = "flex";
            }

            document.querySelector(".popup.view_record").remove();
          } else {
            resetPopupDimmer();
          }
        });

      // thing for the add patient button when expanding the patient info
      if (popup_data.is_add_patient) {
        const infoAddPatientElement = document.querySelector(
          "#add_patient_to_queue",
        );

        infoAddPatientElement.addEventListener("click", () => {
          addDatabasePatient(infoAddPatientElement.dataset.id);
        });
      }
      break;
  }

  return confirmButtonElement;
}

function viewRecord(id, id_type, is_add_patient) {
  fetch("queue_management_pages/crud_php/get_patient_information.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [id_type]: id }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        data["patient_record"]["is_add_patient"] = is_add_patient;

        showPopup(data["patient_record"], "expanded_patient_info");
      } else {
        alert("Failed to get record information: " + data.error);
        navDimmer.classList.remove("loading");
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}

// ------ COUNTER SCRIPTS ------

if (counterStaffSelectElement) {
  getDepartmentQueue(counterStaffSelectElement.value, false);

  counterStaffSelectElement.addEventListener("change", () => {
    // reset global variables for scrolling
    is_fetching = false;
    current_offset = 0;
    has_more_records = true;
    record_total = 0;
    const new_url_params = new URLSearchParams(window.location.search);

    if (new_url_params.has("page")) {
      clearURLSearchParams();
    }

    getDepartmentQueue(counterStaffSelectElement.value);
  });
}

function getDepartmentQueue(selected_department, reload_after = true) {
  fetch("queue_management_pages/crud_php/counter_change_department.php", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      selected_department,
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
        if (reload_after) {
          loadPage(current_page);
        }
      }
    });
}

// ------ SEARCH FUNCTIONS ------

function setSearchFunction(page) {
  const searchInputElement = document.getElementById("search");
  const searchFormElement = document.getElementById("search_form");
  const searchFilterElement =
    document.getElementById("date") || document.getElementById("reason");

  if (searchFilterElement) {
    searchFilterElement.addEventListener("change", () => {
      const filter_data = {
        parameter: searchFilterElement.id,
        value: searchFilterElement.value,
      };
      const query_value = document.querySelector("#search_form input").value;
      document.querySelector("div.table").scrollTo(0, 0);

      searchDatabaseRecords(query_value, page, filter_data);
    });
  }

  // fill values with get url parameters
  const current_url_params = new URLSearchParams(window.location.search);

  if (current_url_params.has("query")) {
    searchInputElement.value = current_url_params.get("query");
  }

  if (current_url_params.has("date")) {
    searchFilterElement.value = current_url_params.get("date");
  }

  if (current_url_params.has("reason")) {
    searchFilterElement.value = current_url_params.get("reason");
  }

  if (counterStaffSelectElement) {
    if (current_url_params.has("department")) {
      counterStaffSelectElement.value = current_url_params.get("department");
      getDepartmentQueue(counterStaffSelectElement.value, false);
    }
  }

  // load search if it exists
  if (current_url_params.has("page")) {
    const get_page = current_url_params.get("page");
    if (get_page === "queue_m_page") {
      searchDatabaseRecords(current_url_params.get("query"), page, null);
    } else {
      let filter_data = null;

      if (searchFilterElement) {
        filter_data = {
          parameter: searchFilterElement.id,
          value: searchFilterElement.value,
        };
      }
      searchDatabaseRecords(current_url_params.get("query"), page, filter_data);
    }
  }

  searchFormElement.addEventListener("submit", (e) => {
    e.preventDefault();
    // reset global variables for searching + scrolling
    is_fetching = false;
    current_offset = 0;
    has_more_records = true;

    document.querySelector("div.table").scrollTo(0, 0);
    let filter_data = null;

    if (searchFilterElement) {
      filter_data = {
        parameter: searchFilterElement.id,
        value: searchFilterElement.value,
      };
    }

    const query_value = document.querySelector("#search_form input").value;
    searchDatabaseRecords(query_value, page, filter_data);
  });
}

function searchDatabaseRecords(query, page, filter_data) {
  // reset for global variables for scrolling
  is_fetching = false;
  current_offset = 0;
  has_more_records = true;
  record_total = 0;
  const params = new URLSearchParams();
  // gemini simplification of the longest if statement i have ever written

  // 1. Define exactly what constitutes an "active search"
  const hasDate = filter_data?.parameter === "date" && filter_data?.value;
  const hasSpecificReason =
    filter_data?.parameter === "reason" && filter_data?.value !== "all";
  const isSearching = query || hasDate || hasSpecificReason;

  // 2. Early Exit: If they aren't searching, just reload and stop running this code immediately
  if (!isSearching) {
    clearURLSearchParams();
    return loadPage(page);
  }

  // 3. If we made it here, we KNOW a search is happening. Safely append our parameters.
  if (query) {
    params.append("query", query);

    // add department if they're a counter user
    if (counterStaffSelectElement) {
      params.append("department", counterStaffSelectElement.value);
    } else {
      const user_department = document.querySelector(
        "input#user_department",
      ).value;
      params.append("department", user_department);
    }
  }

  // Append the filter data (handling the specific "reason=all" edge case you wanted)
  if (filter_data?.value) {
    const { parameter, value } = filter_data;

    if (
      parameter === "date" ||
      (parameter === "reason" && (value !== "all" || query))
    ) {
      params.append(parameter, value);
    }
  }

  // Since we already proved isSearching is true in step 2, we can blindly append the page!
  params.append("page", page);

  let params_query_string = params.toString();
  const new_url = params_query_string
    ? `?${params_query_string}`
    : window.location.pathname;

  window.history.pushState({ path: new_url }, "", new_url);

  // add the offset after link (prevents the results from being cut off)
  params.append("offset", current_offset);
  // add to query string
  params_query_string = params.toString();

  if (page === "queue_m_page") {
    searchQueueManagementPageRecords(query);
  } else {
    getSearch(params_query_string);
  }
}

function searchQueueManagementPageRecords(query) {
  query = query.toLowerCase();

  const addPatientButtonElement = document.getElementById("add_patient");
  addPatientButtonElement.style.display = "none";

  const tableBodyElement = document.querySelector(".table.queue tbody");
  const rowElements = tableBodyElement.querySelectorAll("tr");
  let visible_rows_num = 0;

  rowElements.forEach((row) => {
    const queue_id = row.cells[1].textContent.toLowerCase();
    const patient_id = row.cells[2].textContent.toLowerCase();
    const patient_name = row.cells[3].textContent.toLowerCase();

    if (
      queue_id.includes(query) ||
      patient_id.includes(query) ||
      patient_name.includes(query)
    ) {
      row.style.display = "";
      row.classList.add("search_result");
      row.classList.remove("search_hide");
      visible_rows_num++;

      // fix stripes
      if (visible_rows_num % 2 === 0) {
        row.style.background = "var(--_bg-accent)";
      } else {
        if (row !== rowElements[0]) {
          row.style.background = "var(--_bg)";
        }
      }
    } else {
      row.style.display = "none";
      row.classList.remove("search_result");
      row.classList.add("search_hide");
    }
  });

  const tableDivElement = document.querySelector(".table.queue");
  const tableElement = document.querySelector(".table.queue table");
  let noResultsMessageElement = tableDivElement.querySelector(
    ".no_results_element",
  );

  if (visible_rows_num === 0) {
    noResultsFormatTable(
      tableElement,
      tableDivElement,
      noResultsMessageElement,
      1,
    );
  } else {
    noResultsFormatTable(
      tableElement,
      tableDivElement,
      noResultsMessageElement,
    );
  }
}

function setLoadMoreAtScroll() {
  const tableDivElement = document.querySelector("div.table");

  tableDivElement.addEventListener("scroll", () => {
    if (is_fetching || !has_more_records) return;

    const is_at_bottom =
      tableDivElement.scrollTop + tableDivElement.clientHeight >=
      tableDivElement.scrollHeight - 5;

    if (is_at_bottom) {
      loadMoreRecords();
    }
  });
}

function loadMoreRecords() {
  // add 50 to current offset
  current_offset += 50;
  is_fetching = true;

  if (current_page === "completed_pm_page") {
    // determine if it is a search (get queries exist)
    const current_url = window.location.search;
    const current_params = new URLSearchParams(current_url);
    if (current_params.size !== 0) {
      // slice removes ? at beginning
      // add offset to end
      const updated_query_string = `${window.location.search.slice(1)}&offset=${current_offset}`;
      getSearch(updated_query_string);
      return;
    }

    // normal scrolling
    fetch("queue_management_pages/completed_management_page.php", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        offset: current_offset,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok/File not found");
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data.length);
        if (data.length < 50) {
          has_more_records = false;
        }

        const tableBodyElement = document.querySelector(".table tbody");
        tableBodyElement.insertAdjacentHTML(
          "beforeend",
          generateCompletedRemovedTables(current_page, data),
        );

        is_fetching = false;
      });
  } else if (current_page === "removed_pm_page") {
    // determine if it is a search (get queries exist)
    const current_url = window.location.search;
    const current_params = new URLSearchParams(current_url);
    if (current_params.size !== 0) {
      // slice removes ? at beginning
      // add offset to end
      const updated_query_string = `${window.location.search.slice(1)}&offset=${current_offset}`;
      getSearch(updated_query_string);
      return;
    }

    // normal scrolling
    fetch("queue_management_pages/removed_management_page.php", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        offset: current_offset,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok/File not found");
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data.length);
        if (data.length < 50) {
          has_more_records = false;
        }

        const tableBodyElement = document.querySelector(".table tbody");
        tableBodyElement.insertAdjacentHTML(
          "beforeend",
          generateCompletedRemovedTables(current_page, data),
        );

        is_fetching = false;
      });
  }
}

function getSearch(params_query_string) {
  fetch(`queue_management_pages/crud_php/get_search.php?${params_query_string}`)
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

      // console.log(data.length);
      if (data.length < 50) {
        has_more_records = false;
      }

      const tableDivElement = document.querySelector("div.table");
      const tableElement = document.querySelector("div.table table");
      let noResultsMessageElement = tableDivElement.querySelector(
        ".no_results_element",
      );

      noResultsFormatTable(
        tableElement,
        tableDivElement,
        noResultsMessageElement,
      );

      // if no found results and the offset hasn't been changed
      // this is to prevent the message displaying if the number of results is a multiple of 50
      if (data.length === 0 && current_offset === 0) {
        noResultsFormatTable(
          tableElement,
          tableDivElement,
          noResultsMessageElement,
          1,
        );
      }
      const tableBodyElement = document.querySelector(".table tbody");
      if (current_offset === 0) {
        // 0 offset means that this is the first search table load; rewrite the whole table
        tableBodyElement.innerHTML = generateCompletedRemovedTables(
          current_page,
          data,
        );
      } else {
        // if there's an offset, there's already search data, so append it to the end
        const tableBodyElement = document.querySelector(".table tbody");
        tableBodyElement.insertAdjacentHTML(
          "beforeend",
          generateCompletedRemovedTables(current_page, data),
        );
      }
    });
}

function noResultsFormatTable(
  tableElement,
  tableDivElement,
  noResultsMessageElement,
  state = 0,
) {
  noResultsMessageElement = tableDivElement.querySelector(
    ".no_results_element",
  );

  if (!noResultsMessageElement) {
    noResultsMessageElement = document.createElement("div");
    noResultsMessageElement.className = "no_results_element";
    noResultsMessageElement.textContent =
      "No matching completed records found.";
    tableDivElement.appendChild(noResultsMessageElement);
  }

  // reset if 0, format flex if 1
  if (state === 0) {
    tableElement.style.display = "";
    tableDivElement.style.display = "";
    tableDivElement.style.alignItems = "";
    tableDivElement.style.justifyContent = "";

    if (noResultsMessageElement) noResultsMessageElement.style.display = "none";
  } else {
    tableElement.style.display = "none";

    tableDivElement.style.display = "flex";
    tableDivElement.style.alignItems = "center";
    tableDivElement.style.justifyContent = "center";

    noResultsMessageElement.style.display = "";
  }
}

function generateCompletedRemovedTables(page, data) {
  let fetchedHTML = "";
  let colspan = 5;
  // console.log(data)
  if (page === "completed_pm_page") {
    data.forEach((completed_patient) => {
      record_total++;

      fetchedHTML += `<tr>`;
      fetchedHTML += `<td>${completed_patient.queue_id}</td>`;
      fetchedHTML += `<td>${completed_patient.patient_id}</td>`;
      fetchedHTML += `<td>${completed_patient.patient_name}</td>`;

      // add date for admin
      let date_completed = completed_patient.only_date
        ? ":: " + completed_patient.only_date
        : "";

      // time is formatted automatically by php, so "Time12"
      fetchedHTML += `<td>${completed_patient["Time12"]} ${date_completed}</td>`;

      // see user who marked the record as completed if admin
      if (completed_patient.marked_by) {
        fetchedHTML += `<td>${completed_patient.marked_by}</td>`;
      }
    });
    fetchedHTML += "</tr>";
  } else if (page === "removed_pm_page") {
    colspan = 7;
    
    data.forEach((removed_patient) => {
      record_total++;
      fetchedHTML += `<tr>`;
      fetchedHTML += `<td>${removed_patient.queue_id}</td>`;
      fetchedHTML += `<td>${removed_patient.patient_id}</td>`;
      fetchedHTML += `<td>${removed_patient.patient_name}</td>`;
      fetchedHTML += `<td>${removed_patient.reason}</td>`;

      // add date for admin
      let date_completed = removed_patient.only_date
        ? ":: " + removed_patient.only_date
        : "";

      fetchedHTML += `<td>${removed_patient.Time12} ${date_completed}</td>`;
      if (data[0].removed_by) {
        // if admin, see who removed the record
        fetchedHTML += `<td>${removed_patient.removed_by}</td>`;
      }

      if (
        removed_patient.is_today &&
        removed_patient.reason !== "Auto-flushed: Day has passed"
      ) {
        fetchedHTML += `
          <td><button class="button-default bg-blue restore_button" 
          data-id="${removed_patient.ID}" 
          data-queue-id="${removed_patient.queue_id}"
          data-patient-id="${removed_patient.patient_id}"
          >Restore</button></td>`;
      } else {
        fetchedHTML += `
            <td> 
            ---
            </td>
          `;
      }
      fetchedHTML += `</tr>`;
    });
  }

  if (!has_more_records) {
    let message = `All completed patient records shown (${record_total})`;
    if (window.location.search !== "") {
      message = `All matching records shown (${record_total})`;
    }
    fetchedHTML += `<tr><td colspan="${colspan}" style="text-align: center; background: var(--white-pure); border: none;">${message}</td></tr>`;
  }

  return fetchedHTML;
}
