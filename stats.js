const STATS_KEY = "typing_test_app_runs";
const GOAL_KEY = "typing_test_app_goals";

// Save a typing test run
function saveRun(wpm, accuracy, difficulty, layout) {
  const runs = getRuns();
  const newRun = {
    id: Date.now(),
    date: new Date().toISOString(),
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy),
    difficulty,
    layout
  };
  runs.push(newRun);
  localStorage.setItem(STATS_KEY, JSON.stringify(runs));
  updateStreak();
  return newRun;
}

// Retrieve all runs
function getRuns() {
  const data = localStorage.getItem(STATS_KEY);
  return data ? JSON.parse(data) : [];
}

// Retrieve daily goals
function getGoal() {
  const data = localStorage.getItem(GOAL_KEY);
  return data ? JSON.parse(data) : { wpm: 40, accuracy: 95 };
}

// Save daily goals
function saveGoal(wpm, accuracy) {
  localStorage.setItem(GOAL_KEY, JSON.stringify({ wpm: Math.round(wpm), accuracy: Math.round(accuracy) }));
}

// Update and calculate consecutive days streak
function updateStreak() {
  const runs = getRuns();
  if (runs.length === 0) return 0;

  // Extract unique dates of runs in local format (YYYY-MM-DD)
  const dates = runs.map(run => {
    const d = new Date(run.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const uniqueDates = [...new Set(dates)].sort();

  let streak = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If no run today or yesterday, streak is broken
  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    return 0;
  }

  // Iterate backwards from the latest practice date
  let checkDate = uniqueDates.includes(todayStr) ? today : yesterday;
  while (true) {
    const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (uniqueDates.includes(checkStr)) {
      streak++;
      // Subtract one day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Render historical progress charts on HTML Canvas
function drawProgressChart(canvasId, filterLayout = "all") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  
  // Set resolution based on bounds (handling retina/high-DPI screens)
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Fetch and filter runs
  let runs = getRuns();
  if (filterLayout !== "all") {
    runs = runs.filter(r => r.layout.includes(filterLayout));
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // If not enough data, show placeholder message
  if (runs.length < 2) {
    ctx.font = "14px 'Outfit', sans-serif";
    // Get colors from CSS Variables
    const style = getComputedStyle(document.body);
    ctx.fillStyle = style.getPropertyValue('--text-secondary').trim() || "#888";
    ctx.textAlign = "center";
    ctx.fillText("Complete at least 2 tests to unlock daily history graph!", width / 2, height / 2);
    return;
  }

  // Take the last 10 runs to show in the chart
  const recentRuns = runs.slice(-10);

  // Setup padding
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find Min/Max for WPM values
  const wpms = recentRuns.map(r => r.wpm);
  const maxWpm = Math.max(...wpms, 60); // min ceiling is 60 WPM
  const minWpm = Math.min(...wpms, 0);

  // Styling properties from CSS themes
  const style = getComputedStyle(document.body);
  const accentColor = style.getPropertyValue('--accent-color').trim() || "#66fcf1";
  const textColor = style.getPropertyValue('--text-secondary').trim() || "#c5c6c7";
  const mutedColor = style.getPropertyValue('--untyped-color').trim() || "#444";
  const gridColor = style.getPropertyValue('--panel-border').trim() || "rgba(255,255,255,0.05)";

  // Draw Grid Lines (Y-Axis)
  const steps = 4;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.font = "10px 'Outfit', sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= steps; i++) {
    const val = Math.round(minWpm + ((maxWpm - minWpm) / steps) * i);
    const y = paddingTop + chartHeight - (i / steps) * chartHeight;
    
    // Draw horizontal grid line
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    // Draw Y label
    ctx.fillText(val, paddingLeft - 8, y);
  }

  // X Coordinate calculations
  const getX = (index) => paddingLeft + (index / (recentRuns.length - 1)) * chartWidth;
  const getY = (wpm) => paddingTop + chartHeight - ((wpm - minWpm) / (maxWpm - minWpm)) * chartHeight;

  // Draw Area under line (Gradient)
  const gradientBg = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
  gradientBg.addColorStop(0, accentColor + "33"); // 20% opacity
  gradientBg.addColorStop(1, accentColor + "00"); // Transparent
  
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(recentRuns[0].wpm));
  for (let i = 1; i < recentRuns.length; i++) {
    ctx.lineTo(getX(i), getY(recentRuns[i].wpm));
  }
  ctx.lineTo(getX(recentRuns.length - 1), paddingTop + chartHeight);
  ctx.lineTo(getX(0), paddingTop + chartHeight);
  ctx.closePath();
  ctx.fillStyle = gradientBg;
  ctx.fill();

  // Draw Smooth Line
  ctx.beginPath();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 8;
  ctx.moveTo(getX(0), getY(recentRuns[0].wpm));
  for (let i = 1; i < recentRuns.length; i++) {
    ctx.lineTo(getX(i), getY(recentRuns[i].wpm));
  }
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw Points & X Labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;

  recentRuns.forEach((run, i) => {
    const cx = getX(i);
    const cy = getY(run.wpm);

    // Draw bead outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Draw bead inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Draw index or date labels
    const dateObj = new Date(run.date);
    const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    ctx.fillStyle = textColor;
    ctx.fillText(`#${i + 1}`, cx, paddingTop + chartHeight + 6);
    ctx.font = "8px 'Outfit', sans-serif";
    ctx.fillText(dateStr, cx, paddingTop + chartHeight + 18);
    ctx.font = "10px 'Outfit', sans-serif";
  });
}
