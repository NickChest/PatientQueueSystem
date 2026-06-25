<?php
session_start();
include "../../global/connection.php";
header("Content-Type: application/json");

$username = $_SESSION["username"];

$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

if (!isset($record_id_data["record_id"])) {
  echo json_encode(["success" => false, "error" => "No record ID provided."]);
  exit();
}

$record_id = (int)$record_id_data["record_id"];
$reason = $record_id_data["reason"];

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn->begin_transaction();
  $insert_sql = "INSERT INTO tbl_removed (queue_id, patient_id, patient_name, reason, department, removed_by, added_time_and_date, removed_time_and_date)
                 SELECT queue_id, patient_id, patient_name, ?, department, ?, added_time_and_date, NOW()
                 FROM tbl_queues
                 WHERE ID = ?";
  
  $stmt_insert = $conn->prepare($insert_sql);
  $stmt_insert->bind_param("ssi", $reason, $username, $record_id);
  $stmt_insert->execute();

  if ($stmt_insert->affected_rows === 0) {
    throw new Exception("Record not found in queue table.");
  }
  $stmt_insert->close();

  $delete_sql = "DELETE FROM tbl_queues WHERE ID = ?";
  $stmt_delete = $conn->prepare($delete_sql);
  $stmt_delete->bind_param("i", $record_id);
  $stmt_delete->execute();
  $stmt_delete->close();

  $conn->commit();

  echo json_encode(["success" => true, "message" => "SUCESSFULLY REMOVEDDDDDDDDDDDDDDDDD!!!!!!!!!!"]);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();