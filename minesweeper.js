// Simple Advanced Minesweeper (Beginner/Intermediate/Expert, Win98 style)
(function () {
  const root = document.getElementById('msw98-root');
  if (!root) return;
  // Game settings
  let settings = { rows: 9, cols: 9, mines: 10 };
  let board, revealed, flagged, questioned, timer, timerInterval, smiley, mineCounter, gameOver, started, firstClick;
  // HTML
  root.innerHTML = `
    <div id="msw98-panel">
      <span id="msw98-mine">010</span>
      <span id="msw98-smiley">🙂</span>
      <span id="msw98-timer">000</span>
      <select id="msw98-diff">
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="expert">Expert</option>
      </select>
    </div>
    <div id="msw98-board"></div>  
  `;
  const boardDiv = root.querySelector('#msw98-board');
  smiley = root.querySelector('#msw98-smiley');
  mineCounter = root.querySelector('#msw98-mine');
  timer = root.querySelector('#msw98-timer');
  root.querySelector('#msw98-diff').onchange = function () {
    if (this.value === "beginner") settings = { rows: 9, cols: 9, mines: 10 };
    if (this.value === "intermediate") settings = { rows: 16, cols: 16, mines: 40 };
    if (this.value === "expert") settings = { rows: 16, cols: 30, mines: 99 };
    reset();
  };
  smiley.onclick = reset;

  function reset() {
    clearInterval(timerInterval);
    timer.textContent = "000";
    mineCounter.textContent = settings.mines.toString().padStart(3, "0");
    smiley.textContent = "🙂";
    boardDiv.innerHTML = "";
    boardDiv.style.gridTemplateColumns = `repeat(${settings.cols}, 28px)`;
    board = Array(settings.rows * settings.cols).fill(0);
    revealed = Array(settings.rows * settings.cols).fill(false);
    flagged = Array(settings.rows * settings.cols).fill(false);
    questioned = Array(settings.rows * settings.cols).fill(false);
    gameOver = false;
    started = false;
    firstClick = true;
    draw();
  }

  function placeMines(exclude) {
    let placed = 0;
    while (placed < settings.mines) {
      let idx = Math.floor(Math.random() * settings.rows * settings.cols);
      if (board[idx] === 9 || idx === exclude) continue;
      board[idx] = 9;
      placed++;
    }
    for (let i = 0; i < settings.rows * settings.cols; i++)
      if (board[i] !== 9) board[i] = countMines(i);
  }
  function countMines(i) {
    let r = Math.floor(i / settings.cols),
      c = i % settings.cols,
      cnt = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr,
          nc = c + dc,
          ni = nr * settings.cols + nc;
        if (
          nr >= 0 &&
          nr < settings.rows &&
          nc >= 0 &&
          nc < settings.cols &&
          board[ni] === 9
        )
          cnt++;
      }
    return cnt;
  }
  function draw() {
    boardDiv.innerHTML = "";
    for (let i = 0; i < settings.rows * settings.cols; i++) {
      let cell = document.createElement("div");
      cell.className = "msw98-cell";
      if (revealed[i]) {
        cell.classList.add("open");
        if (board[i] === 9) {
          cell.textContent = "💣";
          cell.classList.add("mine");
        } else if (board[i] > 0) cell.textContent = board[i];
      } else if (flagged[i]) {
        cell.classList.add("flag");
        cell.textContent = "🚩";
      } else if (questioned[i]) {
        cell.classList.add("qmark");
        cell.textContent = "?";
      }
      cell.oncontextmenu = (e) => {
        e.preventDefault();
        if (!gameOver) cycleMark(i);
      };
      cell.onmousedown = (e) => {
        if (gameOver) return;
        if (e.button === 0) smiley.textContent = "😮";
      };
      cell.onmouseup = (e) => {
        if (gameOver) return;
        smiley.textContent = "🙂";
        if (e.button === 0) click(i);
      };
      boardDiv.appendChild(cell);
    }
  }
  function click(i) {
    if (flagged[i] || revealed[i]) return;
    if (firstClick) {
      // Make sure first click is never a mine
      placeMines(i);
      firstClick = false;
      started = true;
      startTimer();
      // If the first cell is a mine (shouldn't be, but safety), re-place mines
      if (board[i] === 9) {
        do {
          board = Array(settings.rows * settings.cols).fill(0);
          placeMines(i);
        } while (board[i] === 9);
      }
    }
    if (board[i] === 9) {
      revealed[i] = true;
      gameOver = true;
      smiley.textContent = "😵";
      revealAll();
      setTimeout(() => alert("Game Over!"), 100);
      stopTimer();
    } else open(i);
    draw();
    if (checkWin()) {
      gameOver = true;
      smiley.textContent = "😎";
      stopTimer();
      setTimeout(() => alert("You Win!"), 100);
    }
  }
  function open(i) {
    if (revealed[i] || flagged[i] || questioned[i]) return;
    revealed[i] = true;
    if (board[i] === 0) {
      let r = Math.floor(i / settings.cols),
        c = i % settings.cols;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          let nr = r + dr,
            nc = c + dc,
            ni = nr * settings.cols + nc;
          if (
            nr >= 0 &&
            nr < settings.rows &&
            nc >= 0 &&
            nc < settings.cols
          )
            open(ni);
        }
    }
  }
  function cycleMark(i) {
    if (revealed[i]) return;
    if (!flagged[i] && !questioned[i]) {
      flagged[i] = true;
    } else if (flagged[i]) {
      flagged[i] = false;
      questioned[i] = true;
    } else if (questioned[i]) {
      questioned[i] = false;
    }
    mineCounter.textContent = (settings.mines - flagged.filter((f) => f).length)
      .toString()
      .padStart(3, "0");
    draw();
  }
  function revealAll() {
    for (let i = 0; i < settings.rows * settings.cols; i++) revealed[i] = true;
    draw();
  }
  function checkWin() {
    for (let i = 0; i < settings.rows * settings.cols; i++)
      if (board[i] !== 9 && !revealed[i]) return false;
    return true;
  }
  function startTimer() {
    let t = 0;
    timer.textContent = "000";
    timerInterval = setInterval(() => {
      t++;
      timer.textContent = t.toString().padStart(3, "0");
      if (t >= 999) stopTimer();
    }, 1000);
  }
  function stopTimer() {
    clearInterval(timerInterval);
  }
  reset();
})();
