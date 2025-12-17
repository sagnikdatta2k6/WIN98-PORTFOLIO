let zIndexCounter = 100;
const windowOrder = ['aboutMe', 'resume', 'contacts', 'skills', 'certifications', 'minesweeper'];
let minimizedWindows = {};


// function openWindow(id) {
//   const win = document.getElementById(id);
//   win.style.display = 'block';
//   win.classList.remove('minimized');
//   minimizedWindows[id] = false;
//   centerWindow(win);
//   bringToFront(id);
//   updateTaskbar();
// }

function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'block';
  win.classList.remove('minimized');
  minimizedWindows[id] = false;
  centerWindow(win);
  bringToFront(id);
  updateTaskbar();
}


function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
  minimizedWindows[id] = false;
  updateTaskbar();
}


function minimizeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
  minimizedWindows[id] = true;
  updateTaskbar();
}


function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win.classList.contains('maximized')) {
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.dataset.prevTransform = win.style.transform;
    win.classList.add('maximized');
    // Optional: set maximized size & position here if needed
  } else {
    win.classList.remove('maximized');
    win.style.top = win.dataset.prevTop || '';
    win.style.left = win.dataset.prevLeft || '';
    win.style.width = win.dataset.prevWidth || '';
    win.style.height = win.dataset.prevHeight || '';
    win.style.transform = win.dataset.prevTransform || '';
  }
  bringToFront(id);
}


function bringToFront(id) {
  const win = document.getElementById(id);
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}


// function centerWindow(win) {
//   if (!win.classList.contains('maximized')) {
//     win.style.top = '50%';
//     win.style.left = '50%';
//     win.style.transform = 'translate(-50%, -50%)';
//     win.style.width = '';
//     win.style.height = '';
//   }
// }

function centerWindow(win) {
  if (win.classList.contains('maximized')) return;

  const width = win.offsetWidth;
  const height = win.offsetHeight;
  win.style.position = 'absolute';
  win.style.transform = 'none'; // Remove any transform
  win.style.left = (window.innerWidth / 2 - width / 2) + 'px';
  win.style.top = (window.innerHeight / 2 - height / 2) + 'px';
}

// Drag logic
// document.querySelectorAll('.window').forEach(win => {
//   const bar = win.querySelector('.title-bar');
//   let isDragging = false, offsetX, offsetY;

//   bar.addEventListener('mousedown', (e) => {
//     if (e.target.tagName === 'BUTTON') return; // Ignore drag from buttons
//     bringToFront(win.id);
//     isDragging = true;
//     offsetX = e.clientX - win.offsetLeft;
//     offsetY = e.clientY - win.offsetTop;
//     document.body.style.userSelect = 'none';
//   });

//   document.addEventListener('mousemove', (e) => {
//     if (isDragging && !win.classList.contains('maximized')) {
//       win.style.left = (e.clientX - offsetX) + 'px';
//       win.style.top = (e.clientY - offsetY) + 'px';
//       win.style.transform = 'none';
//     }
//   });

//   document.addEventListener('mouseup', () => {
//     isDragging = false;
//     document.body.style.userSelect = '';
//   });
// });

document.querySelectorAll('.window').forEach(win => {
  const bar = win.querySelector('.title-bar');
  let isDragging = false;
  let offsetX, offsetY;

  // Ensure window has initial absolute positioning
  if (!win.style.left && !win.classList.contains('maximized')) {
    win.style.position = 'absolute';
    win.style.left = '100px';
    win.style.top = '100px';
  }

  bar.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    bringToFront(win.id);

    // If window is centered with transform, convert to absolute position
    const computed = window.getComputedStyle(win);
    if (computed.transform !== 'none' && computed.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      win.style.transform = 'none';
      win.style.left = (window.innerWidth / 2 - win.offsetWidth / 2) + 'px';
      win.style.top = (window.innerHeight / 2 - win.offsetHeight / 2) + 'px';
    }

    isDragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && !win.classList.contains('maximized')) {
      // Calculate new position
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      // Optional: constrain within viewport
      const maxX = window.innerWidth - win.offsetWidth - 10;
      const maxY = window.innerHeight - win.offsetHeight - 10;
      win.style.left = Math.max(10, Math.min(x, maxX)) + 'px';
      win.style.top = Math.max(10, Math.min(y, maxY)) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
    }
  });
});


// Taskbar logic
function updateTaskbar() {
  const taskbar = document.getElementById('taskbar-windows');
  taskbar.innerHTML = '';
  windowOrder.forEach(id => {
    const win = document.getElementById(id);
    if (win && (win.style.display !== 'none' || minimizedWindows[id])) {
      const btn = document.createElement('button');
      btn.className = 'taskbar-window-btn';
      const titleBarText = win.querySelector('.title-bar-text');
      btn.textContent = titleBarText ? titleBarText.textContent : id;
      if (minimizedWindows[id]) btn.classList.add('minimized');
      btn.onclick = () => {
        if (minimizedWindows[id]) {
          win.style.display = 'block';
          minimizedWindows[id] = false;
          bringToFront(id);
        } else {
          bringToFront(id);
        }
        updateTaskbar();
      };
      if (parseInt(win.style.zIndex) === zIndexCounter && !minimizedWindows[id]) {
        btn.classList.add('active');
      }
      taskbar.appendChild(btn);
    }
  });
}


// Start button press animation
function pressStartButton() {
  document.getElementById('start-btn').classList.add('pressed');
}
function releaseStartButton() {
  setTimeout(() => {
    document.getElementById('start-btn').classList.remove('pressed');
  }, 150);
}


// Start menu logic
function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
}
window.addEventListener('click', function(e) {
  const menu = document.getElementById('start-menu');
  if (!e.target.closest('.start-button') && !e.target.closest('#start-menu')) {
    menu.style.display = 'none';
    document.getElementById('start-btn').classList.remove('pressed');
  }
});


// Clock logic
function updateClock() {
  const clock = document.getElementById('taskbar-clock');
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  if (m < 10) m = '0' + m;
  clock.textContent = h + ':' + m;
}
setInterval(updateClock, 1000);
updateClock();


// Bootup sequence
window.onload = function() {
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    document.getElementById('bios-screen').style.display = 'none';
    document.getElementById('windows-logo-screen').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('windows-logo-screen').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
    }, 2500);
  }, 1800);
};


// Login logic
function checkLogin() {
  const input = document.getElementById('login-password');
  const error = document.getElementById('login-error');
  if (input.value === 'sagnik') {
    document.getElementById('bootup-overlay').style.display = 'none';
    document.body.style.overflow = '';
  } else {
    error.textContent = 'Incorrect password. Try again.';
    input.value = '';
    input.focus();
  }
}


document.getElementById('login-password').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') checkLogin();
});


// Reboot and Lock PC
function rebootPC() {
  document.getElementById('bootup-overlay').style.display = 'flex';
  document.getElementById('bios-screen').style.display = 'flex';
  document.getElementById('windows-logo-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'none';
  setTimeout(() => {
    document.getElementById('bios-screen').style.display = 'none';
    document.getElementById('windows-logo-screen').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('windows-logo-screen').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
    }, 2500);
  }, 1800);
}
function lockPC() {
  document.getElementById('bootup-overlay').style.display = 'flex';
  document.getElementById('bios-screen').style.display = 'none';
  document.getElementById('windows-logo-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}
