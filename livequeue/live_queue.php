<?php
include "../global/connection.php";

$success = false;
$message = "";

if (isset($_GET["queue_id"])) {

  $queue_id = strtoupper($_GET["queue_id"]);
  $sql = "SELECT place, department FROM tbl_queues WHERE queue_id = ?";

  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $queue_id);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    $message = "Queue ID not found, please try again.";
  } elseif ($result->num_rows === 1) {
    $success = true;
    $result_array = $result->fetch_assoc();
    $place = $result_array["place"];

    $waiting = 0;
    $count_sql = "SELECT COUNT(queue_id) FROM tbl_queues WHERE department = ?";

    $count_stmt = $conn->prepare($count_sql);
    $count_stmt->bind_param("s", $result_array["department"]);
    $count_stmt->execute();
    $count_stmt->bind_result($waiting);
    $count_stmt->fetch();
    $count_stmt->close();
  }

  $stmt->close();
  $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel='stylesheet' href='../global/resets.css' />
  <link rel="stylesheet" href="live_queue_style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Inconsolata:wght@200..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <link rel='shortcut icon' href='../global/icon.ico' type='image/x-icon'>
  <title>Live Queue</title>
</head>

<body>
  <div class='logo'>
    <img src='../global/img/Branding.png' alt='Patient Queue System Branding'>
  </div>
  <?php
  if (isset($_GET["queue_id"]) && $success) {
    echo "
    <main>
      <div class='waiting_main'>You are number
        <span>$place</span>
        in line.
      </div>";
  
      if ($place === 1) {
        echo "<div class='waiting'><span class='bolded'>Please proceed to your assigned counter or department.</span> Thank you.</div>";
      } else {
        echo "<div class='waiting'>There are <span class='bolded'>$waiting people</span> in the queue.</div>";
      }
      echo "<div class='queue_id_caption'>Your <span class='bolded'>Queue ID</span> is</div>
      <div class='queue_id'>$queue_id</div>
    </main>
    ";
  } else {
    echo '
    <main>
      <h1>Get updates on your place in the queue.</h1>
      <p><span class="bolded">Scan the QR code on your queue slip</span> or <span class="bolded">type your Queue ID</span> below for live updates on your place in line.</p>
      <form id="queue_id" method="get">
        <div class="message">' . $message . '</div>
        <input type="text" placeholder="XX-123" autocomplete="off" name="queue_id" required>
        <button class="button-default bg-green">Continue</button>
      </form>
    </main>
    ';
  }
  ?>
  <div class="legal">
    <a href="">Privacy Policy</a> | <a href="">About</a>
  </div>
  <script src="live_queue_script.js"></script>
</body>

</html>