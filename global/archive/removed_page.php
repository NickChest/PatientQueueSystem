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
    <title>Removed Patients Management Page | Patient Queue System</title>
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
        <li class="page" title="Removed Patients Management Page" id="selected">
          <div class="rem_pmp_icon icon"></div>
          <div class="name more hidden">Removed</div>
        </li>
        <li class="focused_view" title="Focused View">
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
        <h1>Hemodialysis - Removed Patients</h1>
        <div class="account_info">
          <div class="text">
            <div class="name">De la Cruz, Juan</div>
            <div class="department">Hemodialysis</div>
          </div>
          <img src="../global/img/account.png" alt="" />
        </div>
      </header>
      <article>
        <form action="" method="get" class="search">
          <fieldset>
            <label for="search">Search by Patient ID/Queue ID/Name</label>
            <input type="search" name="search" id="search" />
          </fieldset>
          <fieldset>
            <select name="reason" id="reason">
              <option value="" disabled selected>Reason</option>
            </select>
          </fieldset>
        </form>
        <div class="table removed">
          <table>
            <thead>
              <tr>
                <th>Queue ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>cutoff</td>
                <td><button class="button-default bg-blue" id="restore_button">Restore</button></td>
              </tr>
              <tr>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>holiday</td>
                <td><button class="button-default bg-blue">Restore</button></td>
              </tr>
              <tr>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>spontaneously combusted</td>
                <td><button class="button-default bg-blue">Restore</button></td>
              </tr>
              <tr>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>evaporated</td>
                <td><button class="button-default bg-blue">Restore</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </main>

    <script src="icons.js"></script>
    <script src="page_script.js"></script>
  </body>
</html>
