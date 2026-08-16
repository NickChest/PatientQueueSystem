<?php
include "../../global/connection.php";
include "php_functions.php";
header("Content-Type: application/json");
session_start();

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$username = $_SESSION["username"];
$department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];

$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

if (empty($record_id_data)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "No record ID provided"]);
  exit();
}

$record_id = (int)$record_id_data["record_id"];
$patient_id = (int)$record_id_data["patient_id"];

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn->begin_transaction();
  $insert_sql = "INSERT INTO tbl_queues (queue_id, patient_id, patient_name, department, added_by, added_time_and_date, is_calling)
                 SELECT queue_id, patient_id, patient_name, department, ?, added_time_and_date, 0
                 FROM tbl_removed
                 WHERE ID = ?";

  $stmt_insert = $conn->prepare($insert_sql);
  $stmt_insert->bind_param("si", $username, $record_id);
  $stmt_insert->execute();

  if ($stmt_insert->affected_rows === 0) {
    throw new Exception("Record not found in Removed Patients table.");
  }
  $stmt_insert->close();

  $delete_sql = "DELETE FROM tbl_removed WHERE ID = ?";

  $stmt_delete = $conn->prepare($delete_sql);
  $stmt_delete->bind_param("i", $record_id);
  $stmt_delete->execute();
  $stmt_delete->close();

  // taken from gemini
  $update_place_sql = "UPDATE tbl_queues 
                       SET place = (
                           SELECT COALESCE(MAX(place), 0) + 1 
                           FROM (SELECT * FROM tbl_queues) AS temp_table 
                           WHERE department = ?
                       )
                       WHERE patient_id = ?";

  $stmt_update_place = $conn->prepare($update_place_sql);
  $stmt_update_place->bind_param("si", $_SESSION["user_department"], $patient_id);
  $stmt_update_place->execute();
  $stmt_update_place->close();

  $current_time = date("Y-m-d H:i:s");

  // fix null time bug for if patient is restored alone in queue
  $auto_call_sql = "UPDATE tbl_queues
               SET called_time_and_date = ?, is_calling = 1
               WHERE patient_id = ? AND place = 1";
  $stmt_auto_call = $conn->prepare($auto_call_sql);
  $stmt_auto_call->bind_param("si", $current_time, $patient_id);
  $stmt_auto_call->execute();
  $stmt_auto_call->close();

  $conn->commit();
  echo json_encode(["success" => true, "message" => "YAYAYYAYYYYAYAYAYA RESTOREDDDDDD :DDDDDDDD"]);
  updateTime($conn, "queue", $department);

} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();
