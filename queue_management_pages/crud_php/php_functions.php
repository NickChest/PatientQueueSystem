<?php
// DEPARTMENTS + DEPARTMENT CODES ARE HERE
$departments = [
  "Hemodialysis" => "HM",
  "Radiology" => "RD",
  "Chemotherapy" => "CM",
  "Hearing Test" => "HT",
  "OR" => "OR",
  "ER" => "ER",
  "OPD" => "OPD",
  "X-Ray" => "XR",
  "Eye Center" => "EC"
];

function getExpectedQueueID(string $user_department, $conn, bool $read_only = true)
{
  global $departments;
  // XX for unknown department
  $dept_code = isset($departments[$user_department]) ? $departments[$user_department] : "XX";

  $date_today = date("Y-m-d");

  $new_number = 1;

  $counter_sql = "SELECT last_recorded_date, last_queue_id_num FROM tbl_department_counters WHERE department = ?";

  $counter_stmt = $conn->prepare($counter_sql);
  $counter_stmt->bind_param("s", $user_department);
  $counter_stmt->execute();
  $counter_result = $counter_stmt->get_result();

  if ($counter_result->num_rows > 0) {
    // if department row already exists
    $row = $counter_result->fetch_assoc();

    if ($row["last_recorded_date"] === $date_today) {
      // if date is still today, just add 1 to the id
      $new_number = $row["last_queue_id_num"] + 1;

      if ($read_only) {
        // if it's just gonna show the expected queue id for the popup, stop here. 
        // format the expected id; %03d = add the new number, make it 3 chars long, and replace the blank spaces with 0's
        $queue_id = $dept_code . "-" . sprintf("%03d", $new_number);
        return $queue_id;
      }

      $update_sql = "UPDATE tbl_department_counters SET last_queue_id_num = ? WHERE department = ?";
      $update_stmt = $conn->prepare($update_sql);
      $update_stmt->bind_param("is", $new_number, $user_department);
      $update_stmt->execute();
      $update_stmt->close();
    } else {
      // if last date on table is not today

      // flush records from the queue table if date has already passed, with reason "Auto-flushed: Day has passed" and the removed_by being "system"
      flushQueue($conn);

      if ($read_only) {
        // if it's just gonna show the expected queue id for the popup, stop here. 
        // format the expected id; %03d = add the new number, make it 3 chars long, and replace the blank spaces with 0's
        $queue_id = $dept_code . "-" . sprintf("%03d", $new_number);
        return $queue_id;
      }

      // reset to 1
      $update_sql = "UPDATE tbl_department_counters SET last_recorded_date = ?, last_queue_id_num = 1 WHERE department = ?";
      $update_stmt = $conn->prepare($update_sql);
      $update_stmt->bind_param("ss", $date_today, $user_department);
      $update_stmt->execute();
      $update_stmt->close();
    }
  } else {
    // if this is the first time this department is adding someone to the queue
    $insert_dept_sql = "INSERT INTO tbl_department_counters (department, last_recorded_date, last_queue_id_num) VALUES (?, ?, 1)";

    if ($read_only) {
      // if it's just gonna show the expected queue id for the popup, stop here. 
      // format the expected id; %03d = add the new number, make it 3 chars long, and replace the blank spaces with 0's
      $queue_id = $dept_code . "-" . sprintf("%03d", $new_number);
      return $queue_id;
    }

    $insert_dept_stmt = $conn->prepare($insert_dept_sql);
    $insert_dept_stmt->bind_param("ss", $user_department, $date_today);
    $insert_dept_stmt->execute();
    $insert_dept_stmt->close();
  }
  $counter_stmt->close();

  // format the expected id; %03d = add the new number, make it 3 chars long, and replace the blank spaces with 0's
  $queue_id = $dept_code . "-" . sprintf("%03d", $new_number);
  return $queue_id;
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

function formatName(string $first_name, $middle_name, string $last_name)
{
  return $last_name . ", " . $first_name . ($middle_name ? (" " . $middle_name) : "");
}

function flushQueue($conn)
{
  // this doesn't need to return anything; it should do this discretely since it happens in the background

  // removal time will be when a user logs in to the system again
  $flush_insert_sql = "INSERT INTO tbl_removed (queue_id, patient_id, patient_name, reason, department, removed_by, added_time_and_date, removed_time_and_date)
                       SELECT queue_id, patient_id, patient_name, 'Auto-flushed: Day has passed', department, 'system', added_time_and_date, NOW()
                       FROM tbl_queues
                       WHERE DATE(added_time_and_date) < CURDATE()";

  $flush_insert_stmt = $conn->prepare($flush_insert_sql);
  $flush_insert_stmt->execute();
  $flush_insert_stmt->close();

  $flush_delete_sql = "DELETE FROM tbl_queues WHERE DATE(added_time_and_date) < CURDATE()";

  $flush_delete_stmt = $conn->prepare($flush_delete_sql);
  $flush_delete_stmt->execute();
  $flush_delete_stmt->close();
}

function generateCounterDropdown($conn)
{
  global $departments;

  // $date_clause = "WHERE added_time_and_date >= CURDATE() AND added_time_and_date < CURDATE() + INTERVAL 1 DAY";
  // if ($_SESSION["privileges"] === "admin") {
  //   $date_clause = "";
  // }

  // $sql = "SELECT DISTINCT department from tbl_queues $date_clause ORDER BY department";

  // $stmt = $conn->prepare($sql);
  // $stmt->execute();
  // $result = $stmt->get_result();

  echo "<select id='counter_staff_select' name='counter_staff_select'>";

  // while ($row = $result->fetch_assoc()) {
  //   echo "
  //     <option value='" . $row["department"] . "'>" . $row["department"] . " Queue</option>
  //   ";
  // }

  asort($departments);
  foreach ($departments as $department => $code) {
      echo "
        <option value='$department'>$department Queue</option>
      ";
  }

  echo "</select>";
  // $stmt->close();
  // $conn->close();
}
