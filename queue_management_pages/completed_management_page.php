<?php
session_start();
include "../global/connection.php";
header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$user_department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];

if (empty($user_department)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing department."]);
  exit();
}

// get only the records for today if not admin
$date_clause = "AND marked_time_and_date >= CURDATE() AND marked_time_and_date < CURDATE() + INTERVAL 1 DAY";
$user_clause = "";
if ($_SESSION["privileges"] === "admin") {
  $date_clause = "";
  $user_clause = "marked_by,";
}

//                                                 formats time to be hh:ss AM/PM
$sql = "SELECT queue_id, patient_id, patient_name, $user_clause TIME_FORMAT(marked_time_and_date, '%h:%i %p') AS Time12 FROM tbl_completed WHERE department = ? $date_clause ORDER BY marked_time_and_date DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Database error: " . $conn->error]);
  exit();
}

$stmt->bind_param("s", $user_department);
$stmt->execute();
$result = $stmt->get_result();

$queue_data = [];

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $queue_data[] = $row;
  }
  $result->free();
}

$conn->close();

header("Content-Type: application/json");
echo json_encode($queue_data);
