<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../global/resets.css" />
    <link rel="stylesheet" href="./pages_style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
    <title>Focused View | Patient Queue System</title>
  </head>
  <body>
    <div id="nav_dimmer"></div>
    <nav id="sidebar_nav">
      <ul>
        <li id="nav_burger"><div class="hb_icon icon"></div></li>
        <li class="more branding hidden">
          <img
            src="../global/img/Branding.png"
            alt="Patient Queue System Logo"
          />
        </li>
        <li class="page" title="Queue Management Page">
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
        <li class="focused_view" id="selected" title="Focused View">
          <div class="f_v_icon icon"></div>
          <div class="name more hidden">Focused View</div>
        </li>
        <li class="more logout hidden">
          <button class="button-default bg-red">Log Out</button>
        </li>
      </ul>
    </nav>

    <main>
      <header>
        <h1>Hemodialysis Queue</h1>
        <div class="account_info">
          <div class="text">
            <div class="name">De la Cruz, Juan</div>
            <div class="department">Hemodialysis</div>
          </div>
          <img src="../global/img/account.png" alt="" />
        </div>
      </header>
      <article class="queue_group">
        <div class="upcoming_patients">
          <div class="heading">Upcoming Patients:</div>
          <div class="patients_list">
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
            <div class="patient_group">
              <div class="queue_id">HM-134</div>
              <div class="name">Ibarra y Magsalin, Juan Crisóstomo</div>
            </div>
          </div>
        </div>
        <div class="patient_queue_info">
          <div class="patient_summary">
            <div class="now_serving">Now Serving:</div>
            <div class="queue_id">HM-344</div>
            <div class="name">De los Santos y Alba, María Clara</div>
            <div class="record_link">(<span>Patient ID 1234321</span>)</div>
          </div>
          <div class="wait_summary">
            <div class="queue_time_elapsed">
              Time since first entering queue: 1:35:24
            </div>
            <div class="call_time_elapsed">Time since first call: 2:21</div>
          </div>
          <div class="buttons">
            <button class="call button-default bg-blue">
              <div class="call_icon icon"></div>
            </button>
            <button class="mark_completed button-default bg-green">
              <div class="mark_com_icon icon"></div>
            </button>
            <button class="remove_patient button-default bg-red">
              <div class="rem_icon icon"></div>
            </button>
          </div>
        </div>
      </article>
    </main>
    <script src="icons.js"></script>
    <script src="page_script.js"></script>
  </body>
</html>
