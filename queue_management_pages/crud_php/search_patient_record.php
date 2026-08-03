<?php
include "../../global/patient_database_connection.php";
include "../../global/connection.php";
include "php_functions.php";
session_start();

header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$raw_data = file_get_contents("php://input");
$query_data = json_decode($raw_data, true);

$user_department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];
$user_privileges = $_SESSION["privileges"];


if (empty($user_department)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing department."]);
  exit();
}

$query = "patient_id = ?";
$params = "i";
$values = [];

if (!isset($query_data["last_name"])) {
  if (empty($query_data["patient_id"])) {
    echo json_encode(["success" => false, "error" => "No Patient ID received."]);
    exit();
  }

  $values[] = $query_data["patient_id"];
} else {
  if (empty($query_data["birthdate"])) {
    echo json_encode(["success" => false, "error" => "No birthdate data received."]);
    exit();
  }

  $sub_query = "";

  $values[] = $query_data["last_name"];
  $params = "s";

  if ($query_data["first_name"] !== "") {
    $sub_query = "AND patient_first_name = ?";
    $params .= "s";
    $values[] = $query_data["first_name"];
  }

  $values[] = $query_data["birthdate"];
  $params .= "s";

  $query = "patient_last_name = ? $sub_query AND DATE(patient_birthday) = ?";
}

$sql = "SELECT * FROM tbl_patient_records WHERE $query";
$stmt = $conn_patients->prepare($sql);

if (!$stmt) {
  echo json_encode(["success" => false, "error" => "Database error: " . $conn_patients->error]);
  exit();
}

$stmt->bind_param($params, ...$values);
if (!$stmt->execute()) {
  echo json_encode(["success" => false, "error" => "Query execution failed: " . $stmt->error]);
  exit();
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
  // if no records found, say none were found but querying was a success
  echo json_encode(["success" => true, "found" => false]);
} elseif ($result->num_rows === 1) {

  $patient_record = $result->fetch_assoc();

  // check if patient is already in queue using id
  if (isInQueue($patient_record["patient_id"], $user_department, $user_privileges, $conn)) {
    $formatted_patient_name = formatName($patient_record["patient_first_name"], $patient_record["patient_middle_name"], $patient_record["patient_last_name"]);
    echo json_encode(["success" => true, "in_queue" => true, "patient_id" => $patient_record["patient_id"], "patient_name" => $formatted_patient_name]);
    exit();
  }

  // if exactly one is found and it's not already in the queue, proceed to show the confirmation screen
  $expected_id = getExpectedQueueID($user_department, $conn);

  echo json_encode(["success" => true, "found" => true, "patient_record" => $patient_record, "expected_id" => $expected_id]);
} else {
  // if multiple are found
  if (!isset($query_data["last_name"])) {
    // if the id is searched, uhhh that's an issue if there are multiple matching records
    echo json_encode(["success" => false, "error" => "Critical error! One or more patients may share the same ID."]);
  } else {
    // if details are found, then go display the selection popup
    $multiple_patients = [];

    while ($row = $result->fetch_assoc()) {
      $row["is_in_queue"] = isInQueue($row["patient_id"], $user_department, $user_privileges, $conn);
      $multiple_patients[] = $row;
    }

    $expected_id = getExpectedQueueID($user_department, $conn);

    echo json_encode([
      "success" => true,
      "found" => true,
      "multiple" => true,
      "patient_records" => $multiple_patients,
      "expected_id" => $expected_id
    ]);
  }
}

$stmt->close();
$conn->close();
$conn_patients->close();
