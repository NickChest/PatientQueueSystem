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

$page = $_GET["page"];

$offset = isset($_GET["offset"]) ? (int)$_GET["offset"] : 0;

// !!! by default it's for the tbl_completed !!!

$table = "tbl_completed";
$select_columns = "queue_id, patient_id, patient_name, marked_by, DATE(marked_time_and_date) AS only_date, TIME_FORMAT(marked_time_and_date, '%h:%i %p') AS Time12";

// !!! ----------------------------------- !!!

if (isset($_GET["query"])) {
  // if query isn't blank
  // make it the values for wildcard search
  $query = $_GET["query"];

  // searches for matches on both sides of string
  $wildcard_string = "%" . $query . "%";

  // three params for three identical wildcard strings
  $sql_query = "(queue_id LIKE ? OR patient_id LIKE ? OR patient_name LIKE ?)";
  $params = "sss";
  $values = [$wildcard_string, $wildcard_string, $wildcard_string];

  // if there is date
  // include it in the sql
  if (isset($_GET["date"])) {
    $sql_query .= "AND (marked_time_and_date >= ? AND 
                   marked_time_and_date < ? + INTERVAL 1 DAY)";
    $params .= "ss";
    $dates = [$_GET["date"], $_GET["date"]];
    $values = array_merge($values, $dates);
  }
} else {
  // if query is blank
  // make only date be basis
  $sql_query = "(marked_time_and_date >= ? AND 
                marked_time_and_date < ? + INTERVAL 1 DAY)";
  $params = "ss";
  $values = [$_GET["date"], $_GET["date"]];
}

array_push($values, $offset);


$sql = "SELECT $select_columns FROM $table WHERE department = ? AND $sql_query ORDER BY marked_time_and_date DESC LIMIT 50 OFFSET ? ";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s" . $params . "i", $department, ...$values);
$stmt->execute();
$result = $stmt->get_result();

$search_data = [];
if ($result) {
  while ($row = $result->fetch_assoc()) {
    $date = new DateTime($row["only_date"]);
    $row["only_date"] = $date->format('F j, Y');
    $search_data[] = $row;
  }
}

$stmt->close();
$conn->close();

echo json_encode($search_data);

// if ($page === 'removed_pm_page') {
//   $table = "tbl_removed";
//   $reason = $_GET["reason"];

//   // this can be an equal one and not LIKE because it's a dropdown
//   $removed_query = "reason = ?";

//   if ($query !== "") {
//     // if the query is not blank, include it in the final sql
//     $sql_query .= " AND " . $removed_query;

//     // add one param for the reason
//     $params .= "s";
//     // and value
//     array_push($values, $reason);
//   } else {
//     // if it is blank, just return ones that match the reason
//     $sql_query = $removed_query;

//     // only one param needed now
//     $params = "s";
//     // and only one value
//     $values = [$reason];
//   }
// }