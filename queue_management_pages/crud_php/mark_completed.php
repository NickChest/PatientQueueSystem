<?php
session_start();
include "../../global/connection.php";
header("Content-Type: application/json");

$username = $_SESSION["username"];

// heavily referenced from gemini again
$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

if (!isset($record_id_data["record_id"])) {
  echo json_encode(["success" => false, "error" => "No record ID provided."]);
  exit();
}

$record_id = (int)$record_id_data["record_id"];
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  // basically does a save state
  $conn->begin_transaction();

  $insert_sql = "INSERT INTO tbl_completed (queue_id, patient_id, patient_name, added_time_and_date, marked_time_and_date, marked_by, department) 
                 SELECT queue_id, patient_id, patient_name, added_time_and_date, NOW(), ?, department
                 FROM tbl_queues
                 WHERE ID = ?";

  $stmt_insert = $conn->prepare($insert_sql);
  $stmt_insert->bind_param("si", $username, $record_id);
  $stmt_insert->execute();

  // checks if the insert worked
  if ($stmt_insert->affected_rows === 0) {
    throw new Exception("Record not found in queue table.");
  }
  $stmt_insert->close();

  $delete_sql = "DELETE FROM tbl_queues WHERE ID = ?";
  $stmt_delete = $conn->prepare($delete_sql);
  $stmt_delete->bind_param("i", $record_id);
  $stmt_delete->execute();
  $stmt_delete->close();

  // commit changes
  $conn->commit();

  echo json_encode(["success" => true, "message" => "Marked Completed :DDDDDDD"]);

} catch (Exception $e) {
  // rollback all changes if it failed (wow! i didn't know this was a thing! would've been so useful like a year ago!!!!!!!!!!!!)
  $conn->rollback();
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();