<?php
include "../global/connection.php";
session_start();

header("Content-Type: application/json");

$queue_id = $_GET["queue_id"];

$sql_place = "SELECT place, department FROM tbl_queues WHERE queue_id = ?";

$stmt = $conn->prepare($sql_place);
if (!$stmt) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Database error: " . $conn->error]);
  exit();
}
$stmt->bind_param("s", $queue_id);

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  // check pages
  $table_endings = array("completed", "removed");
  $reason = "";
  $check = "";

  foreach ($table_endings as $ending) {
    $table = "tbl_$ending";

    // date clause (since users will only ever use this for the day they queued)
    $sql_check = "SELECT department FROM $table WHERE queue_id = ? 
                  AND added_time_and_date >= CURDATE() 
                  AND added_time_and_date < CURDATE() + INTERVAL 1 DAY";
    $stmt_check = $conn->prepare($sql_check);
    if (!$stmt_check) {
      header("Content-Type: application/json");
      echo json_encode(["error" => "Database error: " . $conn->error]);
      exit();
    }
    $stmt_check->bind_param("s", $queue_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows === 1) {
      $reason = $ending;
      $stmt_check->close();
      break;
    }
  }

  $conn->close();
  echo json_encode(["unqueued" => true, "reason" => $reason, "check" => $check]);
  exit();
}

$success = true;
$result_array = $result->fetch_assoc();
$place = $result_array["place"];

$waiting = 0;
$count_sql = "SELECT COUNT(queue_id) FROM tbl_queues WHERE department = ?";

$count_stmt = $conn->prepare($count_sql);

if (!$count_stmt) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Database error: " . $conn->error]);
  exit();
}

$count_stmt->bind_param("s", $result_array["department"]);
$count_stmt->execute();
$count_stmt->bind_result($waiting);
$count_stmt->fetch();
$count_stmt->close();
$conn->close();
echo json_encode(["place" => $place, "waiting" => $waiting]);
