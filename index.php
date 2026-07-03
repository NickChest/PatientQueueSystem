<?php include_once 'global/connection.php' ?>
<?php include_once 'queue_management_pages/crud_php/php_functions.php' ?>
<?php session_start() ?>

<?php
$message = "";

if (!empty($_POST)) {
  if (isset($_POST["username"]) && isset($_POST["password"])) {
    $sql = "SELECT * FROM tbl_users WHERE username = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $_POST["username"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
      $user = $result->fetch_assoc();

      if (password_verify($_POST["password"], $user["password_hash"])) {
        $_SESSION["username"] = $user["username"];
        $_SESSION["user_department"] = $user["department"];
        $_SESSION["viewing_department"] = $user["department"];
        $_SESSION["privileges"] = $user["privileges"];
        $_SESSION["staff_name"] = $user["staff_name"];
      } else {
        $message = "Incorrect username or password.";
      }
    } else {
      $message = "Incorrect username or password.";
    }
    $stmt->close();
  }

  if (isset($_POST["logout"])) {
    $_SESSION = [];
    session_destroy();
  }
}

?>

<!doctype html>
<html lang='en'>

<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <link rel='stylesheet' href='global/resets.css' />
  <link rel='stylesheet' href='queue_management_pages/pages_style.css' />
  <link rel='stylesheet' href='queue_management_pages/login_style.css' />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Inconsolata:wght@200..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <script src="global/qrcodejs-master/qrcode.min.js"></script>
  <link rel='shortcut icon' href='global/icon.ico' type='image/x-icon'>
  <title>Login | Patient Queue System</title>
</head>

<body <?php if (!isset($_SESSION['username'])) echo 'class="login back-gradient"'; ?>>
  <?php
  if (isset($_SESSION['username'])) {
    echo "
      <div id='dimmer'></div>
      <div id='popup_container'></div>
      <nav id='sidebar_nav'>
        <ul>
          <li id='nav_burger'>
            <div class='hb_icon icon'></div>
          </li>
          <li class='more branding hidden'>
            <img
              src='global/img/Branding.png'
              alt='Patient Queue System Logo' />
          </li>
          <li class='page' id='selected' title='Queue Management Page' data-page='queue_m_page'>
            <div class='q_pmp_icon icon'></div>
            <div class='name more hidden'>Queue</div>
          </li>
          <li class='page' title='Completed Patients Management Page' data-page='completed_pm_page'>
            <div class='com_pmp_icon icon'></div>
            <div class='name more hidden'>Completed</div>
          </li>
          <li class='page' title='Removed Patients Management Page' data-page='removed_pm_page'>
            <div class='rem_pmp_icon icon'></div>
            <div class='name more hidden'>Removed</div>
          </li>
          <li class='page focused_view' title='Focused View' data-page='focused_view'>
            <div class='f_v_icon icon'></div>
            <div class='name more hidden'>Focused View</div>
          </li>
          <li class='more logout hidden'>
            <form action='' method='POST'><button class='button-default bg-red' name='logout' value='logout'>Log Out</button></form>
          </li>
        </ul>
      </nav>
      </nav>
      <main>
        <header>";

    if ($_SESSION["user_department"] !== "Counter") {
      echo "
        <h1>{$_SESSION['user_department']} <span id='current_page_text'>Queue</span></h1>
        ";
    } else {
      generateCounterDropdown();
    }
    echo "   
          <div class='account_info'>
            <div class='text'>
              <div class='name'>{$_SESSION['staff_name']}</div>
              <div class='department'>{$_SESSION['user_department']} " . ucfirst($_SESSION['privileges']) . "</div>
              <input type='hidden' name='user_department' id='user_department' value={$_SESSION['user_department']}>
            </div>
            <img src='global/img/account.png' alt='' />
          </div>
        </header>
        <article>
        </article>
      </main>

      <script src='queue_management_pages/icons.js'></script>
      <script src='queue_management_pages/page_script.js'></script>
      <script src='queue_management_pages/queue_management_tbl_script.js'></script>
      <script src='queue_management_pages/add_patient.js'></script>
      <script src='queue_management_pages/removed_management_page.js'></script>
      <script src='queue_management_pages/focused_view_script.js'></script>
    ";
  } else {
    echo "
    <form method='POST' action=''>
      <fieldset>
        <img
          src='global/img/Gemini_Generated_Image_1v7jse1v7jse1v7j.png'
          alt='Hospital Logo'
        />
        <h1>Centralized Patient Queue System Login</h1>
      </fieldset>
      <fieldset>
        <div>
          <label for='username'>Username</label>
          <input type='text' id='username' name='username' autocomplete='off' required />
        </div>
        <div>
          <label for='password'>Password</label>
          <input type='password' id='password' name='password' required />
        </div>
      </fieldset>
      <div class='message'>{$message}</div>
      <fieldset><input type='submit' value='Log In' class='button-default bg-green' /></fieldset>
      <div class='ver_copyright'>
        ver 0.0.1 | Harrow + Ammit Medical Center © 2026
      </div>
    </form>

    <script src='queue_management_pages/login_script.js'></script>
    ";
  }

  $conn->close();
  ?>
</body>

</html>