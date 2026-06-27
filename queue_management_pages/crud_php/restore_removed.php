<?php
session_start();
include "../../global/connection.php";
header("Content-Type: application/json");

$username = $_SESSION["username"];
$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

if (!isset($record_id_data["record_id"])) {
  echo json_encode(["success" => false, "error" => "No record ID provided"]);
  exit();
}

$record_id = (int)$record_id_data["record_id"];
$patient_id = (int)$record_id_data["patient_id"];

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn->begin_transaction();
  $insert_sql = "INSERT INTO tbl_queues (queue_id, patient_id, patient_name, department, added_by, added_time_and_date, is_calling, is_new)
                 SELECT queue_id, patient_id, patient_name, department, ?, added_time_and_date, 0, 0
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

  // TODO: fix is_calling and called_time_and_date when record is restored and is first
  
  $stmt_update_place = $conn->prepare($update_place_sql);
  $stmt_update_place->bind_param("si", $_SESSION["user_department"], $patient_id);
  $stmt_update_place->execute();
  $stmt_update_place->close();

  $conn->commit();
  echo json_encode(["success" => true, "message" => "YAYAYYAYYYYAYAYAYA RESTOREDDDDDD :DDDDDDDD"]);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();
