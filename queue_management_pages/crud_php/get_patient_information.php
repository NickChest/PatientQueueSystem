<?php
include "../../global/patient_database_connection.php";
session_start();

header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

if (!isset($record_id_data["patient_record_id"]) && !isset($record_id_data["patient_id"])) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "No record ID data received."]);
  exit();
}

$sql = "";
$query_id = "";

if (isset($record_id_data["patient_record_id"])) {
  $sql = "SELECT * FROM tbl_patient_records WHERE ID = ?";
  $query_id = (int)$record_id_data["patient_record_id"];
}

if (isset($record_id_data["patient_id"])) {
  $sql = "SELECT * FROM tbl_patient_records WHERE patient_id = ?";
  $query_id = (int)$record_id_data["patient_id"];
}

$stmt = $conn_patients->prepare($sql);
if (!$stmt) {
  echo json_encode(["success" => false, "error" => "Database error: " . $conn_patients->error]);
  exit();
}

$stmt->bind_param("i", $query_id);
if (!$stmt->execute()) {
  echo json_encode(["success" => false, "error" => "Query execution failed: " . $stmt->error]);
  exit();
}

$result = $stmt->get_result();
$patient_record = $result->fetch_assoc();

if (!isset($patient_record["patient_middle_name"])) {
  $patient_record["patient_middle_name"] = "N/A";
}

//fix birthday formatting
$patient_record["patient_birthday"] = date_format(new \DateTimeImmutable($patient_record["patient_birthday"]), "F d, Y");

echo json_encode(["success" => true, "patient_record" => $patient_record]);

$stmt->close();
$conn_patients->close();
