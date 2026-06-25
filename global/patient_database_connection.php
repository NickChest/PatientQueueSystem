<?php
  date_default_timezone_set("Asia/Manila");

  $conn_patients = mysqli_connect("localhost", "root", "", "haa_med_center_pms_database");

  if ($conn_patients->connect_error) {
    die("Connection failed: ".$conn_patients->connect_error);
  }
?>