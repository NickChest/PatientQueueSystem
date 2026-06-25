<?php include_once "../global/connection.php" ?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../global/resets.css" />
    <link rel="stylesheet" href="pages_style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
    <title>Queue Management Page | Patient Queue System</title>
  </head>
  <body>
    <div id="nav_dimmer"></div>
    <nav id="sidebar_nav">
      <ul>
        <li id="nav_burger"><div class="hb_icon icon"></div></li>
        <li class="more branding hidden">
          <img
            src="global/img/Branding.png"
            alt="Patient Queue System Logo"
          />
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
    <main>
      <header>
        <h1>Hemodialysis Queue</h1>
        <div class="account_info">
          <div class="text">
            <div class="name">De la Cruz, Juan</div>
            <div class="department">Hemodialysis</div>
          </div>
          <img src="global/img/account.png" alt="" />
        </div>
      </header>
      <article>
        <form action="" method="get" class="search">
          <fieldset>
            <label for="search">Search by Patient ID/Queue ID/Name</label>
            <input type="search" name="search" id="search" />
          </fieldset>
        </form>
        <div class="table queue">
          <table>
            <thead>
              <tr>
                <th>Place</th>
                <th>Queue ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php 
                $_SESSION["user_department"] = "Hemodialysis";
                $user_department = $_SESSION["user_department"];

                $sql = "SELECT place, queue_id, patient_id, patient_name FROM tbl_queues WHERE department = ?";

                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $user_department);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result-> num_rows > 0) {
                  while ($row = $result-> fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>{$row['place']}</td>";
                    echo "<td>{$row['queue_id']}</td>";
                    echo "<td>{$row['patient_id']}</td>";
                    echo "<td>{$row['patient_name']}</td>";
                    echo "<td></td>";
                    echo "</tr>";
                  }
                }

                $conn->close();
              ?>
              <!-- <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>aaaaaaa</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">
                      <div class="call_icon icon"></div>
                    </button>
                    <div class="line"></div>
                    <button class="mark_completed button-default bg-green">
                      <div class="mark_com_icon icon"></div>
                    </button>
                    <button class="remove_patient button-default bg-red">
                      <div class="rem_icon icon"></div>
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>bbbbb</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>xxxxxx</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>HM-123</td>
                <td>137245</td>
                <td>Ibarra y Magsalin, Juan Crisóstomo</td>
                <td>
                  <div class="actions">
                    <button class="call button-default bg-blue">Info</button>
                    <div class="line"></div>
                    <button class="remove_patient button-default bg-red">
                      Remove Patient
                    </button>
                    <div class="drag_handle">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M55 41.875C55 40.84 54.16 40 53.125 40H6.875C5.84 40 5 40.84 5 41.875C5 42.91 5.84 43.75 6.875 43.75H53.125C54.16 43.75 55 42.91 55 41.875ZM55 29.375C55 28.34 54.16 27.5 53.125 27.5H6.875C5.84 27.5 5 28.34 5 29.375C5 30.41 5.84 31.25 6.875 31.25H53.125C54.16 31.25 55 30.41 55 29.375ZM55 16.875C55 15.84 54.16 15 53.125 15H6.875C5.84 15 5 15.84 5 16.875C5 17.91 5.84 18.75 6.875 18.75H53.125C54.16 18.75 55 17.91 55 16.875Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr> -->
            </tbody>
          </table>
        </div>
        <button class="add_patient button-default bg-green">Add Patient</button>
      </article>
    </main>

    <script src="icons.js"></script>
    <script src="page_script.js"></script>
    <script src="queue_management_tbl_script.js"></script>
  </body>
</html>
