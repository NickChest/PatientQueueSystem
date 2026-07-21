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

  // reload page BEFORE adding so the queue reflects the latest version on the database (this is in case another user changed the places)
  loadPage("queue_m_page");

  fetch("queue_management_pages/crud_php/add_patient_to_queue.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ record_id }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      navDimmer.classList.remove("loading");
      if (data.success) {
        const popup_data = {
          heading: "Add Patient Success",
          success_icon: true,
          message: `<span class="bolded">Patient ID ${data.patient_id} (${data.formatted_name})</span><br>was <span class="bolded">added to the queue</span><br>Queue ID: <span class="bolded">${data.queue_id}</span>`,
        };

        showPopup(popup_data, "success_popup");
        generateQueueSlip(data);

        // users can only add patients on the queue management page
        loadPage("queue_m_page");
      } else {
        alert("Failed to add patient to queue: " + data.error);
      }
    })
    .catch((error) => {
      console.error("AJAX Error: ", error);
    });
}

function generateQueueSlip(patient_queue_data) {
  // GENERATE QUEUE SLIP AND QR CODE
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  const server_ip = window.location.hostname;
  const tracking_url = `http://${server_ip}/PatientQueueSystem/livequeue/live_queue.php?queue_id=${patient_queue_data.queue_id}`;

  const tempDivElement = document.createElement("div");

  new QRCode(tempDivElement, {
    text: tracking_url,
    width: 100,
    height: 100,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
  });

  setTimeout(() => {
    const qrcode_canvas = tempDivElement.querySelector("canvas");
    const qrcode_base64_img = qrcode_canvas.toDataURL("image/png");

    const queueSlipHTML = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Inconsolata:wght@200..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <style>
            @page {
              size: 4.25in 5.5in;
              margin: 0;
            }

            body {
              width: 4.25in;
              height: 6.5in;
              margin: 0;
              padding: 0.25in; /* Safe padding so text doesn't touch the paper edge */
              box-sizing: border-box;
              font-family: Arial, sans-serif;
              font-size: 10pt; /* Points (pt) are best for readable printed text */
              text-align: center;
              font-family: "Inconsolata", Consolas;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            h1,
            h2,
            .queue_id,
            span,
            .date_and_time,
            .reminder {
              font-weight: bold;
            }
            h1 {
              font-size: 15pt;
              line-height: 0.5ch;
            }
            h2 {
              line-height: 2ch;
              font-size: 10pt;
            }
            .queue_id {
              font-size: 50pt;
            }
            img {
              width: 1in;
              height: 1in;
              margin-block: 5pt;
            }
            .date_and_time,
            .waiting {
              font-size: 15pt;
              line-height: 2ch;
            }
            .reminder {
              font-size: 15pt;
              margin-block: 15pt;
              line-height: 2ch;
            }
            .reminder_2 {
              font-size: 10pt;
              margin-bottom: 10pt;
              line-height: 2ch;
            }
            .reminder_live_queue {
              font-size: 10pt;
              line-height: 2ch;
            }
          </style>
        </head>
        <body>
          <h1>H+A MEDICAL CENTER</h1>
          <h2>CENTRALIZED PATIENT QUEUE SYSTEM<br />QUEUE SLIP</h2>
          <div class="queue_id">${patient_queue_data.queue_id}</div>
          <img src="${qrcode_base64_img}" alt="QR CODE" />
          <div class="date_and_time">${patient_queue_data.date_and_time}</div>
          <div class="waiting">Waiting ahead: <span>${patient_queue_data.waiting}</span></div>
          <div class="reminder">Please wait for your<br />number to be called.</div>
          <div class="reminder_2">
            <span>Numbers may not be called<br />in sequence.</span> Thank you.
          </div>
          <div class="reminder_live_queue">
            Scan the QR code to
            get live<br />updates on your place in queue.
          </div>
        </body>
      </html>
  `;

    //   <div class="reminder_live_queue">
    //   Scan the QR code or visit<br /><span>www.HAMedCenterQueue.com</span> to
    //   get live<br />updates on your place in queue.
    // </div>

    iframe.srcdoc = queueSlipHTML;

    iframe.onload = () => {
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  }, 50);
}
