<?php
session_start();
include "../../global/connection.php";
include "../../global/patient_database_connection.php";
include "php_functions.php";

header("Content-Type: application/json");

$username = $_SESSION["username"];
$department = $_SESSION["user_department"];

$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

$place_sql = "SELECT COALESCE(MAX(place), 0) + 1 AS new_place FROM tbl_queues WHERE department = ?";

$place_stmt = $conn->prepare($place_sql);
$place_stmt->bind_param("s", $department);
$place_stmt->execute();

$place_row = $place_stmt->get_result()->fetch_assoc();
$new_place = (int)$place_row["new_place"];
$place_stmt->close();

$called_time = null;
$is_new = 0;
$is_calling = 0;

if ($new_place === 1) {
  $called_time = date('Y-m-d H:i:s');
  $is_calling = 1;
  $is_new = 1;
}

if (!isset($record_id_data["record_id"])) {
  echo json_encode(["success" => false, "error" => "No record ID provided."]);
  exit();
}

$record_id = (int)$record_id_data["record_id"];
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$select_sql = "SELECT patient_id, patient_first_name, patient_middle_name, patient_last_name FROM tbl_patient_records WHERE ID = ?";

$select_stmt = $conn_patients->prepare($select_sql);

if (!$select_stmt) {
  echo json_encode(["success" => false, "error" => "Database error: " . $conn_patients->error]);
  exit();
}

$select_stmt->bind_param("i", $record_id);
if (!$select_stmt->execute()) {
  echo json_encode(["success" => false, "error" => "Query execution failed: " . $select_stmt->error]);
  exit();
}

$patient_record = $select_stmt->get_result()->fetch_assoc();
$select_stmt->close();

$queue_id = getExpectedQueueID($department, $conn, false);
$patient_id = $patient_record["patient_id"];

// get number of people waiting ahead
$waiting = 0;
$date_clause = "AND added_time_and_date >= CURDATE() AND added_time_and_date < CURDATE() + INTERVAL 1 DAY";
$count_sql = "SELECT COUNT(queue_id) FROM tbl_queues WHERE department = ? $date_clause";

$count_stmt = $conn->prepare($count_sql);
$count_stmt->bind_param("s", $department);
$count_stmt->execute();
$count_stmt->bind_result($waiting);
$count_stmt->fetch();
$count_stmt->close();


$formatted_name = formatName($patient_record["patient_first_name"], $patient_record["patient_middle_name"], $patient_record["patient_last_name"]);

$insert_sql = "INSERT INTO tbl_queues (place, queue_id, patient_id, patient_name, department, added_by, added_time_and_date, called_time_and_date, is_calling, is_new)
               VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)";

$insert_stmt = $conn->prepare($insert_sql);
if (!$insert_stmt) {
  echo json_encode(["success" => false, "error" => "Database error: " . $conn_patients->error]);
  exit();
}

$insert_stmt->bind_param("isissssii", $new_place, $queue_id, $patient_id, $formatted_name, $department, $_SESSION["username"], $called_time, $is_calling, $is_new);
$insert_stmt->execute();

if ($insert_stmt->affected_rows === 0) {
  throw new Exception("Could not insert record into queue.");
}
$insert_stmt->close();

echo json_encode(["success" => true, "patient_id" => $patient_id, "formatted_name" => $formatted_name, "queue_id" => $queue_id, "date_and_time" => date('Y-d-m | h:i:s A'), "waiting" => $waiting]);

$conn_patients->close();
$conn->close();
