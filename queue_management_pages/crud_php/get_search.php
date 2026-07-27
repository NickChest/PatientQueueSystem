<?php
include "../../global/connection.php";
session_start();

header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];

if (empty($department)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing department."]);
  exit();
}

$query = $_GET["query"];
$page = $_GET["page"];

// !!! by default it's for the queue_m_page !!!
$table = "tbl_queues";
$sql_query = "department=? AND (queue_id LIKE ? OR patient_id LIKE ? OR patient_name LIKE ?)";

// searches for matches on both sides of string
$wildcard_string = "%" . $query . "%";

// one param for dept, three params for three identical wildcard strings
$params = "ssss";

$values = [$department, $wildcard_string, $wildcard_string, $wildcard_string];

// !!! ----------------------------------- !!!

switch ($page) {
  case 'completed_pm_page':
    $date = $_GET["date"];
    $table = "tbl_completed";
    $completed_query = "marked_time_and_date >= ? 
                        AND marked_time_and_date < ? + INTERVAL 1 DAY";
    $completed_values = [$date, $date];

    if ($query !== "") {
      // if the query is not blank, include it in the final sql
      $sql_query .= " AND " . $completed_query;

      // add two more params for the date
      $params .= "ss";
      // and two more values
      array_merge($values, $completed_values);
    } else {
      // if the query is blank, just return ones that match the date
      $sql_query = $completed_query;

      // only two params now for date
      $params = "ss";
      // and only two values
      $values = $completed_values;
    }
    break;
  case 'removed_pm_page':
    $table = "tbl_removed";
    $reason = $_GET["reason"];

    // this can be an equal one and not LIKE because it's a dropdown
    $removed_query = "reason = ?";

    if ($query !== "") {
      // if the query is not blank, include it in the final sql
      $sql_query .= " AND " . $removed_query;

      // add one param for the reason
      $params .= "s";
      // and value
      array_push($values, $reason);
    } else {
      // if it is blank, just return ones that match the reason
      $sql_query = $removed_query;

      // only one param needed now
      $params = "s";
      // and only one value
      $values = [$reason];
    }
    break;

    // you can't search in focused view so it's not here
}




$sql = "SELECT * FROM $table WHERE $sql_query";
$stmt = $conn->prepare($sql);
$stmt->bind_param($params, ...$values);
$stmt->execute();
$result = $stmt->get_result();

$search_data = [];
if ($result) {
  while ($row = $result->fetch_assoc()) {
    $search_data[] = $row;
  }
}

$stmt->close();
$conn->close();

echo json_encode($search_data);
