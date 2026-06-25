<?php include_once "global/connection.php" ?>

<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="global/resets.css" />
  <link rel="stylesheet" href="queue_management_pages/pages_style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet" />
  <title>Queue Management Page | Patient Queue System</title>
</head>

<body>
  <div id="nav_dimmer"></div>
  <nav id="sidebar_nav">
    <ul>
      <li id="nav_burger">
        <div class="hb_icon icon"></div>
      </li>
      <li class="more branding hidden">
        <img
          src="global/img/Branding.png"
          alt="Patient Queue System Logo" />
      </li>
      <li class="page" id="selected" title="Queue Management Page">
        <div class="q_pmp_icon icon"></div>
        <div class="name more hidden">Queue</div>
      </li>
      <li class="page" title="Completed Patients Management Page">
        <div class="com_pmp_icon icon"></div>
        <div class="name more hidden">Completed</div>
      </li>
      <li class="page" title="Removed Patients Management Page">
        <div class="rem_pmp_icon icon"></div>
        <div class="name more hidden">Removed</div>
      </li>
      <li class="page focused_view" title="Focused View">
        <div class="f_v_icon icon"></div>
        <div class="name more hidden">Focused View</div>
      </li>
      <li class="more logout hidden">
        <button class="button-default bg-red">Log Out</button>
      </li>
    </ul>
  </nav>
  </nav>
  <main>
    <?php 
      include "./queue_management_pages/queue_management_page.php";
    ?>
  </main>

  <script src="queue_management_pages/icons.js"></script>
  <script src="queue_management_pages/page_script.js"></script>
  <script src="queue_management_pages/queue_management_tbl_script.js"></script>
</body>

</html>