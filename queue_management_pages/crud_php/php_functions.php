<?php
function getExpectedQueueID(string $user_department, $conn)
{
  // DEPARTMENT CODES FOR QUEUE ID HERE
  $department_codes = [
    "Hemodialysis" => "HM",
    "Radiology" => "RD",
    "Chemotherapy" => "CM",
    "Hearing Test" => "HT",
    "OR" => "OR",
    "ER" => "ER",
    "OPD" => "OPD"
  ];

  // XX for unknown department
  $dept_code = isset($department_codes[$user_department]) ? $department_codes[$user_department] : "XX";

  $queue_sql = "SELECT queue_id FROM tbl_queues WHERE department = ? ORDER BY queue_id DESC LIMIT 1";

  $queue_stmt = $conn->prepare($queue_sql);
  $queue_stmt->bind_param("s", $user_department);
  $queue_stmt->execute();
  $queue_id_result = $queue_stmt->get_result();

  if ($queue_id_result->num_rows > 0) {
    // get the last record
    $last_record = $queue_id_result->fetch_assoc();
    $queue_id_string = $last_record["queue_id"];

    // explode it; "HM-123" -> "HM", "123"
    $parts = explode("-", $queue_id_string);

    // turn the number into an int to remove the 0's
    $last_number = (int)$parts[1];

    $new_number = $last_number + 1;
  } else {
    $new_number = 1;
  }
  $queue_stmt->close();

  // format the expected id; %03d = add the new number, make it 3 chars long, and replace the blank spaces with 0's
  $expected_id = $dept_code . "-" . sprintf("%03d", $new_number);

  return $expected_id;
};

function isInQueue(int $patient_id, string $user_department, string $user_privileges, $conn)
{
  $date_clause = "AND added_time_and_date >= CURDATE() AND added_time_and_date < CURDATE() + INTERVAL 1 DAY";
  if ($user_privileges === "admin") {
    $date_clause = "";
  }

  $sql = "SELECT queue_id FROM tbl_queues WHERE patient_id = ? AND department = ? $date_clause";

  $stmt = $conn->prepare($sql);
  $stmt->bind_param("is", $patient_id, $user_department);
  $stmt->execute();
  $result = $stmt->get_result();

  return $result->num_rows > 0;
}

function formatName(string $first_name, string $middle_name, string $last_name)
{
  return $last_name . ", " . $first_name . ($middle_name ? (" " . $middle_name) : "");
}
