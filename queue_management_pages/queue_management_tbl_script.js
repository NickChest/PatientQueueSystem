// ------ CODE FOR NAV AND DECLARATION FOR DIMMER ------
const burgerElement = document.getElementById("nav_burger");
const navElement = document.getElementById("sidebar_nav");
const navDimmer = document.getElementById("dimmer");
const popupContainerElement = document.getElementById("popup_container");

burgerElement.addEventListener("click", () => {
  navFunction();
});

navDimmer.addEventListener("click", () => {
  // make it so that user can't interact with anything while process is ongoing
  if (navDimmer.classList.contains("loading")) return;

  if (navDimmer.classList.contains("nav")) {
    navFunction();
  } else if (navDimmer.classList.contains("popup")) {
    resetPopupDimmer();
  }
});

function navFunction() {
  burgerElement.classList.toggle("hidden");
  navElement.classList.toggle("open");
  navDimmer.classList.toggle("open");
  navDimmer.classList.toggle("nav");
  const showMoreElements = document.querySelectorAll(".more");

  showMoreElements.forEach((more) => {
    more.classList.toggle("hidden");
  });
}

function resetPopupDimmer() {
  popupContainerElement.innerHTML = "";
  navDimmer.className = "";
}

// ------ FUNCTION TO ADD QUEUE MANAGEMENT PAGE FEATURES ------
function setQueuePageFunctions() {
  const tbodyElement = document.querySelector("tbody");
  const rowElements = tbodyElement.children;
  // console.log(rowElements);

  // ------ CODE FOR TABLE/RECORD FUNCTIONS ------
  tbodyElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging_row = tbodyElement.querySelector(".dragging");
    const row_siblings = [
      ...tbodyElement.querySelectorAll("tr:not(.dragging)"),
    ];

    // gemini solution for dragging being relative to screen instead of container
    const tableSize = document.querySelector("table").getBoundingClientRect();
    // console.log(row_siblings)

    let next_sibling = row_siblings.find((sibling) => {
      return (
        e.clientY - tableSize.top <=
        sibling.offsetTop + sibling.offsetHeight / 2
      );
    });
    // console.log(next_sibling)

    tbodyElement.insertBefore(dragging_row, next_sibling);
    updatePlaces(rowElements);
    updateDragHandles();
  });
  tbodyElement.addEventListener("dragenter", (e) => e.preventDefault());

  document.querySelector("tbody").addEventListener("dragend", () => {
    updateDatabasePlaces("queue_m_page");
  });

  let dragHandleElements = document.querySelectorAll(".drag_handle");

  function removeDraggable() {
    for (const row of rowElements) {
      row.setAttribute("draggable", false);
      // row.style.background = "red";
    }
  }

  function updateDragHandles() {
    dragHandleElements = document.querySelectorAll(".drag_handle");
    removeDraggable();
    dragHandleElements.forEach((drag_handle) => {
      drag_handle.addEventListener("mouseover", () => {
        // code heavily referenced from CodingNepal

        // console.log("hi")
        for (const row of rowElements) {
          // row.style.background = "green";

          // console.log(row);
          row.setAttribute("draggable", true);
          row.addEventListener("dragstart", () => {
            setTimeout(() => {
              (row.classList.add("dragging"), 0);
            });
          });
          row.addEventListener("dragend", () => {
            row.classList.remove("dragging");
            // updatePlaces();
          });
        }
      });

      drag_handle.addEventListener("mouseout", () => {
        // console.log("bye")
        removeDraggable();
      });
    });
  }

  document.querySelector("table").addEventListener("mouseleave", () => {
    removeDraggable();
  });

  updatePlaces(rowElements);
  updateDragHandles();

  // ----- CODE FOR MARKED COMPLETED BUTTON -----
}

function markedCompletedFunction() {
  const firstRowElement = document.querySelector("tbody tr:first-child");

  const record_id = firstRowElement.firstElementChild.dataset.id;
  const queue_id = firstRowElement.childNodes[1].textContent;

  const popup_data = {
    heading: "Mark Completed",
    record_id: record_id,
    queue_id: queue_id,
    patient_id: firstRowElement.childNodes[2].textContent,
    message: 'will be <span class="bolded">removed from the queue</span>.',
  };

  const confirmButtonElement = showPopup(popup_data, "confirm_popup");

  confirmButtonElement.addEventListener("click", () => {
    moveDatabaseMarkCompleted(record_id, queue_id, "queue_m_page");
    navDimmer.classList.add("loading");
  });
}

function moveDatabaseMarkCompleted(record_id, queue_id, page) {
  fetch("queue_management_pages/crud_php/mark_completed.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ record_id }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        clearInterval(queue_interval);
        clearInterval(call_interval);
        navDimmer.classList.remove("loading");
        const popup_data = {
          heading: "Patient Marked Completed",
          queue_id,
          success_icon: true,
          message: `Queue ID <span class="bolded">${queue_id}</span> was <br><span class="bolded">removed from the queue.</span>`,
        };

        showPopup(popup_data, "success_popup");

        loadPage(page);
      } else {
        alert("Failed to move record: " + data.error);
        navDimmer.classList.remove("loading");
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}

function removePatientFunction(patient_info, page) {
  const reasonFormElement = showPopup("", "remove_patient_reason");
  reasonFormElement.addEventListener("submit", (e) => {
    e.preventDefault();

    let reason = document.querySelector(
      "input[name='reason_select']:checked",
    ).value;

    if (reason === "other") {
      reason = document.querySelector("input[name='other_textbox']").value;
    }

    // make new javascript object
    let patient_info_with_popup_data = {};
    // copy data over
    patient_info_with_popup_data = patient_info;

    //add reason
    patient_info_with_popup_data["reason"] = reason;

    // add popup information (heading, message, and custom options)
    patient_info_with_popup_data["heading"] = "Confirm Removal";
    patient_info_with_popup_data["message"] =
      'will be <span class="bolded">skipped and removed from the queue</span>.<br><span class="bolded">Are you sure?</span>';
    patient_info_with_popup_data["options"] = {
      confirm: "Yes, I'm sure",
      cancel: "No, go back",
    };

    const confirmButtonElement = showPopup(
      patient_info_with_popup_data,
      "confirm_popup",
    );
    confirmButtonElement.addEventListener("click", () => {
      navDimmer.classList.add("loading");
      moveDatabaseRemovePatient(patient_info_with_popup_data, page);
    });
  });
}

function moveDatabaseRemovePatient(patient_info, page) {
  fetch("queue_management_pages/crud_php/remove_patient.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      record_id: patient_info["record_id"],
      reason: patient_info["reason"],
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        clearInterval(queue_interval);
        clearInterval(call_interval);
        navDimmer.classList.remove("loading");

        popup_data = {
          heading: "Patient Removed",
          message: `Queue ID <span class="bolded">${patient_info["queue_id"]}</span> was <br><span class="bolded">removed from the queue.</span>`,
        };

        showPopup(popup_data, "success_popup");

        loadPage(page);
      } else {
        alert("Failed to move record: " + data.error);
        navDimmer.classList.remove("loading");
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}

function updatePlaces(rowElements) {
  //note/TODO: add record_id to info button
  let current_place = 1;
  for (const row of rowElements) {
    row.firstElementChild.textContent = current_place;
    current_place++;

    if (row === rowElements[0]) {
      row.lastElementChild.innerHTML = `
      <div class="actions">
        <button class="call button-default bg-blue" id="call_button">
          <div class="call_icon icon">
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.137 3.945C12.493 3.571 12.095 2.875 12.096 2.125V2.122C12.097 0.95 11.158 0 10 0C8.842 0 7.903 0.95 7.903 2.122V2.125C7.904 2.876 7.507 3.571 6.862 3.945C2.195 6.657 4.877 15.66 0 17.251V19H20V17.251C15.123 15.66 17.805 6.657 13.137 3.945ZM10 1C10.552 1 11 1.449 11 2C11 2.552 10.552 3 10 3C9.448 3 9 2.552 9 2C9 1.449 9.448 1 10 1ZM13 21C13 22.598 11.608 24 10.029 24C8.45 24 7 22.598 7 21H13Z" fill="white"/>
            </svg>
          </div>
        </button>
        <div class="line"></div>
        <button class="mark_completed button-default bg-green" id="mark_completed">
          <div class="mark_com_icon icon">
            <svg width="24" height="17" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M23.2023 0.460614C23.4972 0.755927 23.6629 1.15624 23.6629 1.57361C23.6629 1.99099 23.4972 2.3913 23.2023 2.68661L9.55229 16.3366C9.25697 16.6316 8.85666 16.7972 8.43929 16.7972C8.02191 16.7972 7.6216 16.6316 7.32629 16.3366L0.501287 9.51161C0.346544 9.36742 0.22243 9.19354 0.136347 9.00034C0.0502636 8.80715 0.00397636 8.59859 0.000245117 8.38711C-0.00348613 8.17563 0.0354151 7.96557 0.114629 7.76946C0.193843 7.57334 0.311747 7.39519 0.461306 7.24563C0.610866 7.09607 0.789017 6.97817 0.985132 6.89896C1.18125 6.81974 1.39131 6.78084 1.60278 6.78457C1.81426 6.7883 2.02282 6.83459 2.21602 6.92067C2.40922 7.00676 2.5831 7.13087 2.72729 7.28561L8.43929 12.9976L20.9763 0.460614C21.2716 0.165668 21.6719 0 22.0893 0C22.5067 0 22.907 0.165668 23.2023 0.460614Z" fill="white"/>
            </svg>
          </div>
        </button>
        <button class="remove_patient button-default bg-red" class="remove_patient">
          <div class="rem_icon icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8625 11.6065L20.7265 4.74255C21.0305 4.45455 21.2065 4.05455 21.2065 3.60655C21.2061 3.28977 21.1119 2.98022 20.9358 2.71689C20.7598 2.45355 20.5097 2.24821 20.2171 2.12674C19.9246 2.00527 19.6026 1.9731 19.2918 2.03428C18.981 2.09546 18.6952 2.24726 18.4705 2.47055L11.6065 9.35055L4.74255 2.47055C4.44126 2.16926 4.03263 2 3.60655 2C3.18046 2 2.77183 2.16926 2.47055 2.47055C2.16926 2.77183 2 3.18046 2 3.60655C2 4.03263 2.16926 4.44126 2.47055 4.74255L9.35055 11.6065L2.48655 18.4705C2.18255 18.7585 2.00655 19.1585 2.00655 19.6065C2.007 19.9233 2.1012 20.2329 2.27727 20.4962C2.45334 20.7595 2.7034 20.9649 2.99596 21.0864C3.28852 21.2078 3.61048 21.24 3.92129 21.1788C4.2321 21.1176 4.51785 20.9658 4.74255 20.7425L11.6065 13.8625L18.4705 20.7265C18.7585 21.0305 19.1585 21.2065 19.6065 21.2065C19.9233 21.2061 20.2329 21.1119 20.4962 20.9358C20.7595 20.7598 20.9649 20.5097 21.0864 20.2171C21.2078 19.9246 21.24 19.6026 21.1788 19.2918C21.1176 18.981 20.9658 18.6952 20.7425 18.4705L13.8625 11.6065Z" fill="white"/>
            </svg>
          </div>
        </button>
        <div class="drag_handle">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
              fill="black"
            />
          </svg>
        </div>
      </div>
      `;
      const markedCompletedElement = document.getElementById("mark_completed");
      markedCompletedElement.addEventListener("click", () => {
        markedCompletedFunction();
      });
    } else {
      row.lastElementChild.innerHTML = `
      <div class="actions">
        <button class="info button-default bg-blue">Info</button>
        <div class="line"></div>
        <button class="remove_patient button-default bg-red">
          Remove Patient
        </button>
        <div class="drag_handle">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
              fill="black"
            />
          </svg>
        </div>
      </div>
      `;
    }
  }

  const removePatientButtonElements =
    document.querySelectorAll(".remove_patient");
  removePatientButtonElements.forEach((removePatientButton) => {
    removePatientButton.addEventListener("click", () => {
      // absolutely HORRID looking selector but this is the most robust way to determine the button's record
      const currentRecord =
        removePatientButton.parentElement.parentElement.parentElement;

      const patient_info = {
        queue_id: currentRecord.childNodes[1].textContent,
        record_id: currentRecord.childNodes[0].dataset.id,
        patient_id: currentRecord.childNodes[2].textContent,
      };

      removePatientFunction(patient_info, "queue_m_page");
    });
  });

  const infoButtonElements = document.querySelectorAll(".info");
  infoButtonElements.forEach((infoButton) => {
    infoButton.addEventListener("click", () => {
      const currentRecord =
        infoButton.parentElement.parentElement.parentElement;

      const patient_id = currentRecord.childNodes[2].textContent;

      viewRecord(patient_id, "patient_id", false);
    });
  });
}

function updateDatabasePlaces(page) {
  let new_order = [];

  if (page === "queue_m_page") {
    const newRowsOrderElements = document.querySelectorAll("tbody tr");

    // heavily referenced from gemini (I AM NOT VIBE CODING I AM TYPING THIS OUT MYSELF BTW)
    newRowsOrderElements.forEach((row) => {
      const tdPlaceElement = row.firstElementChild;

      new_order.push({
        record_id: tdPlaceElement.dataset.id,
        new_place: tdPlaceElement.textContent,
      });
    });
  } else if (page === "focused_view") {
    const patientRecordIDData = document.querySelectorAll(".record_id");
    // console.log(patientRecordIDData.length)

    for (let i = 0; i < patientRecordIDData.length; i++) {
      if (i === 0) {
        // first in queue is "last" in html;
        // put it in first place
        new_order.push({
          record_id: patientRecordIDData[patientRecordIDData.length - 1].value,
          new_place: i + 1,
        });
        continue;
      } else if (i === 1) {
        // put the first element in html in second
        new_order.push({
          record_id: patientRecordIDData[0].value,
          new_place: i + 1,
        });
      } else {
        // put the rest in
        new_order.push({
          record_id: patientRecordIDData[i - 1].value,
          new_place: i + 1,
        });
      }
    }
  }

  fetch("queue_management_pages/crud_php/update_places.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(new_order),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        // alert(`Queue order updated successfully. \n(${data.updated_rows} records updated)`);
      } else {
        alert(`Failed to save order. Error: ` + data.error);
        navDimmer.classList.remove("loading");
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}
