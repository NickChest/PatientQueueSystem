<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="../global/resets.css" />
  <link rel="stylesheet" href="information_style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet" />
  <link rel='shortcut icon' href='../global/icon.ico' type='image/x-icon'>
  <title>Information Screen</title>
</head>

<body>
  <header>
    <div id="date"><?php echo date('F j, Y') ?></div>
    <div class="title">Patient Queuing System</div>
    <div id="time">_</div>
  </header>
  <div class="confirm">Please click the screen to continue</div>
  <main>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="service_info_group"></article>
    <article class="video">
      <video
        src="../global/video/placeholder_1920_1080_24fps.mp4"
        autoplay
        loop
        muted></video>
    </article>
  </main>

  <script src="information_script.js"></script>
</body>

</html>