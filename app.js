// Main Application Logic for Typing Test App

// Game state variables
let testActive = false;
let testStartTime = null;
let testTimerInterval = null;
let paragraphText = "";
let charactersList = [];
let currentCharIndex = 0;
let totalTypedChars = 0;
let correctTypedChars = 0;
let errorsCount = 0;
let keyMistakes = {}; // Tracks mistakes per character key
let timerDuration = 60; // default 60s
let timeRemaining = 60;
let testMode = "time"; // 'time', 'word', 'untimed'
let wordLimit = 25; // default 25 words for word mode
let selectedLanguage = "english"; // 'english', 'hindi'
let selectedLayout = "english"; // 'english', 'remington', 'inscript'
let selectedDifficulty = "easy"; // 'easy', 'medium', 'hard'
let isZenMode = false;
let isStrictMode = false;
let soundProfile = "mechanical"; // 'mechanical', 'typewriter', 'bubble', 'none'
let soundVolume = 50;
let currentActivity = "test"; // 'test' or 'learn'
let selectedLessonIndex = 0;

// O(1) DOM caching variables for lag-free performance
let keyboardDomCache = {};
let lastHighlightedKeyEl = null;

// Chunked loading state variables for 3000-word support without lag
let allSessionWords = [];
let currentWordChunkOffset = 0;
const CHUNK_SIZE = 80;
let accumulatedCorrectTypedChars = 0;
let accumulatedTotalTypedChars = 0;
let accumulatedErrorsCount = 0;

// Game Mode state variables
let gameActive = false;
let gameScore = 0;
let gameLevel = 1;
let gameLives = 3;
let fallingWords = []; // Array of { id, text, x, y, speed, el }
let gameTimerInterval = null;
let gameSpawnInterval = null;
let wordIdCounter = 0;

// Audio Context for synthetic sound effects
let audioCtx = null;
let noiseBuffer = null;

// Initialize the application once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initThemes();
  initListeners();
  populateLessonsDropdown();
  loadStreak();
  resetTest();
});

// Theme Management
function initThemes() {
  const savedTheme = localStorage.getItem("typing_test_app_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const themeBtn = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
  if (themeBtn) {
    document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
    themeBtn.classList.add("active");
  }
}

function setTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("typing_test_app_theme", themeName);
  document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
  const themeBtn = document.querySelector(`.theme-btn[data-theme="${themeName}"]`);
  if (themeBtn) themeBtn.classList.add("active");
  
  // Re-draw chart to match theme colors
  setTimeout(() => drawProgressChart("historyChart", selectedLayout), 100);
}

// Sound Synthesis Functions using Web Audio API (100% Offline)
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!noiseBuffer) {
    // Performance: Pre-generate a 1-second white noise buffer once to avoid loop on keydown
    const bufferSize = audioCtx.sampleRate;
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playClickSound() {
  if (soundProfile === "none") return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const vol = soundVolume / 100;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0, now);

    if (soundProfile === "mechanical") {
      // High-pitched mechanical switch tick + small noise click
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);

      // Noise burst for mechanical feel using pre-generated white noise
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1500;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.008);
      
    } else if (soundProfile === "typewriter") {
      // Hollow clack sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      gain.gain.setValueAtTime(vol * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);

    } else if (soundProfile === "bubble") {
      // Satisfying bubble pop
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.035);
      gain.gain.setValueAtTime(vol * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    }
  } catch (err) {
    console.error("Audio Click failed", err);
  }
}

function playErrorSound() {
  if (soundProfile === "none") return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const vol = soundVolume / 100;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    
    gain.gain.setValueAtTime(vol * 0.4, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {
    console.error("Audio Error failed", err);
  }
}

function playSuccessChime() {
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      gain.gain.setValueAtTime(0.2, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.3);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  } catch (err) {
    console.error("Success Chime failed", err);
  }
}

// LocalStorage Streak Tracker
function loadStreak() {
  const streak = updateStreak();
  const streakBadge = document.getElementById("streakBadge");
  if (streakBadge) {
    if (streak > 0) {
      streakBadge.style.display = "flex";
      document.getElementById("streakCount").textContent = `${streak} Day Streak`;
    } else {
      streakBadge.style.display = "none";
    }
  }
}

// Set up UI Event Listeners
function initListeners() {
  const hiddenInput = document.getElementById("hiddenInput");
  const typingArena = document.getElementById("typingArena");
  const focusIndicator = document.getElementById("focusIndicator");

  const setFocusState = (isFocused) => {
    if (isFocused) {
      typingArena.classList.add("focused");
      focusIndicator.classList.add("focused");
      const dot = focusIndicator.querySelector(".status-dot");
      const text = focusIndicator.querySelector(".status-text");
      if (dot) dot.style.backgroundColor = "#2ecc71";
      if (text) text.textContent = "Active";
    } else {
      typingArena.classList.remove("focused");
      focusIndicator.classList.remove("focused");
      const dot = focusIndicator.querySelector(".status-dot");
      const text = focusIndicator.querySelector(".status-text");
      if (dot) dot.style.backgroundColor = "#e67e22";
      if (text) text.textContent = "Click to focus";
    }
  };

  // Focus trigger on arena click (only if start overlay is hidden)
  typingArena.addEventListener("click", (e) => {
    const startOverlay = document.getElementById("typingStartOverlay");
    if (startOverlay && !startOverlay.classList.contains("hidden")) {
      return;
    }
    hiddenInput.focus();
    setFocusState(true);
  });

  hiddenInput.addEventListener("focus", () => {
    // Prevent focus if start overlay is visible
    const startOverlay = document.getElementById("typingStartOverlay");
    if (startOverlay && !startOverlay.classList.contains("hidden")) {
      hiddenInput.blur();
      return;
    }
    setFocusState(true);
  });

  hiddenInput.addEventListener("blur", () => {
    setFocusState(false);
  });

  // Restart Button
  document.getElementById("restartBtn").addEventListener("click", () => {
    resetTest();
  });

  // Activity Switcher (Test vs Learn)
  document.querySelectorAll(".activity-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".activity-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setActivityType(btn.dataset.activity);
      hiddenInput.focus();
    });
  });

  // Lesson Select change
  document.getElementById("lessonSelect").addEventListener("change", (e) => {
    selectedLessonIndex = parseInt(e.target.value) || 0;
    resetTest();
    hiddenInput.focus();
  });

  // Game Start Button
  document.getElementById("startGameBtn").addEventListener("click", startPracticeGame);
  
  // Game Quit Button
  document.getElementById("quitGameBtn").addEventListener("click", () => {
    setActivityType("test");
    document.querySelectorAll(".activity-btn").forEach(b => {
      b.classList.remove("active");
      if (b.dataset.activity === "test") b.classList.add("active");
    });
  });

  // Game Input matching
  const gameInput = document.getElementById("gameInput");
  gameInput.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    const key = e.key;
    if (key === "Backspace") return;
    
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      checkGameWordMatch(e.target.value.trim());
      return;
    }
    
    if (key.length === 1) {
      e.preventDefault();
      let typedChar = key;
      if (selectedLanguage === "hindi") {
        typedChar = INSCRIPT_MAP[key] || key;
      }
      
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      e.target.value = val.substring(0, start) + typedChar + val.substring(end);
      e.target.setSelectionRange(start + typedChar.length, start + typedChar.length);
      
      checkGameWordPrefix(e.target.value.trim());
    }
  });

  gameInput.addEventListener("keyup", (e) => {
    if (e.key === "Backspace") {
      checkGameWordPrefix(e.target.value.trim());
    }
  });

  // Handle typing key intercepts and conversions
  hiddenInput.addEventListener("keydown", handleKeydown);

  // Start Practice Button Overlay click
  document.getElementById("startPracticeBtn").addEventListener("click", () => {
    document.getElementById("typingStartOverlay").classList.add("hidden");
    
    // Start timer immediately!
    startTestTimer();
    
    // Focus the typing arena input
    hiddenInput.focus();
    setFocusState(true);
  });

  // Language selectors
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLanguage = btn.dataset.lang;
      
      // Auto-update layout based on language
      if (selectedLanguage === "english") {
        selectedLayout = "english";
      } else {
        selectedLayout = "inscript";
      }
      
      // Refresh lessons dropdown for the selected language
      populateLessonsDropdown();
      selectedLessonIndex = 0;
      const lessonSelect = document.getElementById("lessonSelect");
      if (lessonSelect) lessonSelect.value = 0;
      
      resetTest();
    });
  });

  // Difficulty Dropdown
  document.getElementById("diffSelect").addEventListener("change", (e) => {
    selectedDifficulty = e.target.value;
    resetTest();
  });

  // Mode buttons (Time, Word, Untimed)
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      testMode = btn.dataset.mode;

      // Toggle configuration panel visibility
      document.getElementById("timeModeConfig").style.display = testMode === "time" ? "block" : "none";
      document.getElementById("wordModeConfig").style.display = testMode === "word" ? "block" : "none";

      resetTest();
    });
  });

  // Time custom entry (presets in seconds, custom in minutes)
  document.getElementById("timerSelect").addEventListener("change", (e) => {
    const customTimeInput = document.getElementById("customTimeInput");
    if (e.target.value === "custom") {
      customTimeInput.style.display = "inline-block";
      timerDuration = (parseInt(customTimeInput.value) || 5) * 60; // Default 5 minutes
    } else {
      customTimeInput.style.display = "none";
      timerDuration = parseInt(e.target.value);
    }
    resetTest();
  });

  document.getElementById("customTimeInput").addEventListener("input", (e) => {
    timerDuration = (parseInt(e.target.value) || 1) * 60; // Multiply custom minutes by 60
    resetTest();
  });

  // Word count limit select
  document.getElementById("wordSelect").addEventListener("change", (e) => {
    wordLimit = parseInt(e.target.value);
    resetTest();
  });

  // Sound Profile Select
  document.getElementById("soundSelect").addEventListener("change", (e) => {
    soundProfile = e.target.value;
  });

  // Volume Slider
  document.getElementById("volumeSlider").addEventListener("input", (e) => {
    soundVolume = parseInt(e.target.value);
    document.getElementById("volValue").textContent = `${soundVolume}%`;
  });

  // Zen Mode Toggle
  document.getElementById("zenToggle").addEventListener("change", (e) => {
    isZenMode = e.target.checked;
    const statsHeader = document.getElementById("statsHeader");
    if (isZenMode && testActive) {
      statsHeader.style.opacity = "0.08";
    } else {
      statsHeader.style.opacity = "1";
    }
  });

  // Strict Mode Toggle
  document.getElementById("strictToggle").addEventListener("change", (e) => {
    isStrictMode = e.target.checked;
    resetTest();
  });

  // Custom Text Practice Textarea
  document.getElementById("customTextToggle").addEventListener("change", (e) => {
    const area = document.getElementById("customTextInputArea");
    area.style.display = e.target.checked ? "flex" : "none";
    resetTest();
  });

  document.getElementById("customText").addEventListener("input", () => {
    resetTest();
  });

  // Theme click listeners
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setTheme(btn.dataset.theme);
    });
  });

  // Goal Inputs Settings
  const savedGoal = getGoal();
  document.getElementById("goalWpm").value = savedGoal.wpm;
  document.getElementById("goalAcc").value = savedGoal.accuracy;

  document.getElementById("saveGoalBtn").addEventListener("click", () => {
    const wpm = parseInt(document.getElementById("goalWpm").value) || 40;
    const acc = parseInt(document.getElementById("goalAcc").value) || 95;
    saveGoal(wpm, acc);
    showToast("Daily Goal updated successfully!");
  });

  // Report Modal close
  document.getElementById("closeReportBtn").addEventListener("click", () => {
    document.getElementById("reportModalOverlay").classList.remove("open");
    resetTest();
    document.getElementById("hiddenInput").focus();
  });

  // Fetch News Trigger (Online Mode helper)
  document.getElementById("fetchNewsBtn").addEventListener("click", fetchLatestNews);
}

// Fetch dynamic online headlines as fallback or actual articles
async function fetchLatestNews() {
  const fetchBtn = document.getElementById("fetchNewsBtn");
  fetchBtn.disabled = true;
  fetchBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Fetching...`;
  
  try {
    let text = "";
    if (selectedLanguage === "english") {
      const response = await fetch("https://dummyjson.com/quotes/random");
      if (!response.ok) throw new Error("CORS or server error");
      const data = await response.json();
      text = data.quote + " (" + data.author + ")";
    } else {
      // Since free Hindi APIs are limited, fetch a random Wikipedia paragraph in Devanagari or fallback safely
      // For absolute correctness and robustness:
      const fallbackHindiQuotes = [
        "शिक्षा सबसे शक्तिशाली हथियार है जिसका उपयोग आप दुनिया को बदलने के लिए कर सकते हैं।",
        "सफलता अंतिम नहीं है, असफलता घातक नहीं है: जारी रखने का साहस ही मायने रखता है।",
        "खुद को बदलो, तो ही समाज बदलेगा; दूसरों को दोष देने से कुछ हासिल नहीं होता।",
        "कर्म करो फल की चिंता मत करो, क्योंकि मेहनत कभी बेकार नहीं जाती।"
      ];
      text = fallbackHindiQuotes[Math.floor(Math.random() * fallbackHindiQuotes.length)];
    }
    
    // Toggle Custom Text Practice to true and paste the fetched quote
    document.getElementById("customTextToggle").checked = true;
    document.getElementById("customTextInputArea").style.display = "flex";
    document.getElementById("customText").value = text;
    
    showToast("Fetched fresh article successfully!");
    resetTest();
  } catch (err) {
    showToast("Unable to fetch online. Used database shuffled paragraph.");
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.innerHTML = `<i class="fas fa-rss"></i> Fetch Today's News`;
  }
}

// Toast indicator banner
function showToast(message) {
  const toast = document.getElementById("toastBanner");
  document.getElementById("toastMessage").textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Reset typing session values
function resetTest() {
  testActive = false;
  testStartTime = null;
  clearInterval(testTimerInterval);
  testTimerInterval = null;

  // Reset chunked loading state
  allSessionWords = [];
  currentWordChunkOffset = 0;
  accumulatedCorrectTypedChars = 0;
  accumulatedTotalTypedChars = 0;
  accumulatedErrorsCount = 0;
  lastHighlightedKeyEl = null;

  // Load paragraph text
  if (currentActivity === "learn") {
    const list = selectedLanguage === "english" ? ENGLISH_LESSONS : HINDI_LESSONS;
    const lesson = list[selectedLessonIndex] || list[0];
    paragraphText = lesson.text;
  } else {
    const isCustomEnabled = document.getElementById("customTextToggle").checked;
    const customVal = document.getElementById("customText").value.trim();

    if (isCustomEnabled && customVal.length > 0) {
      paragraphText = customVal;
    } else {
      // Get array from database
      const db = selectedLanguage === "english" ? ENGLISH_TEXTS : HINDI_TEXTS;
      const list = db[selectedDifficulty] || db.easy;
      
      // Calculate how many words are needed to fill the chosen session duration
      let wordsNeeded = 50; 
      if (testMode === "time") {
        // Set a buffer of 200 WPM (so even fast typists never run out of words)
        wordsNeeded = Math.ceil((timerDuration / 60) * 200); 
      } else if (testMode === "untimed") {
        wordsNeeded = 2500; // Provide a large 2500-word paragraph for untimed runs as requested
      }

      let selectedTexts = [];
      let currentWordCount = 0;
      
      if (list && list.length > 0) {
        // Combine random sentences from database until word threshold is satisfied
        while (currentWordCount < wordsNeeded) {
          const randText = list[Math.floor(Math.random() * list.length)];
          selectedTexts.push(randText);
          currentWordCount += randText.split(/\s+/).length;
        }
        paragraphText = selectedTexts.join(" ");
      } else {
        paragraphText = "fallback typing text";
      }
    }
  }

  // Pre-process Hindi text spaces to prevent rendering glitches
  paragraphText = paragraphText.replace(/\s+/g, " ");

  // Split overall paragraph text into word array
  allSessionWords = paragraphText.split(" ");
  
  // If word target mode, slice the overall array to the requested word limit
  if (testMode === "word") {
    allSessionWords = allSessionWords.slice(0, Math.min(allSessionWords.length, wordLimit));
  }

  // Set up the first word chunk
  currentWordChunkOffset = 0;
  const chunkWords = allSessionWords.slice(currentWordChunkOffset, currentWordChunkOffset + CHUNK_SIZE);
  currentWordChunkOffset += CHUNK_SIZE;

  // Flatten the chunk into characters list
  charactersList = [];
  chunkWords.forEach((w, wIdx) => {
    for (let i = 0; i < w.length; i++) {
      charactersList.push({
        char: w[i],
        wordIndex: wIdx,
        status: "untyped"
      });
    }
    // Add space after word (except the last word)
    if (wIdx < chunkWords.length - 1) {
      charactersList.push({
        char: " ",
        wordIndex: wIdx,
        status: "untyped"
      });
    }
  });

  currentCharIndex = 0;
  totalTypedChars = 0;
  correctTypedChars = 0;
  errorsCount = 0;
  keyMistakes = {};

  // Configure timer display
  if (testMode === "time") {
    timeRemaining = timerDuration;
  } else {
    timeRemaining = 0;
  }
  updateStatsPanel();

  // Show Zen Mode reset
  document.getElementById("statsHeader").style.opacity = "1";

  // Clear hidden input field
  document.getElementById("hiddenInput").value = "";

  // Reset scroll translation offset
  document.getElementById("wordsContainer").style.transform = "translateY(0)";

  // Show the Start Typing Overlay again
  const startOverlay = document.getElementById("typingStartOverlay");
  if (startOverlay) {
    startOverlay.classList.remove("hidden");
  }

  // Render text to arena
  renderParagraph();
  renderKeyboardLayout();
  highlightVirtualKey();
  
  // Render Daily History Chart
  drawProgressChart("historyChart", selectedLayout);
}

function renderParagraph() {
  const container = document.getElementById("wordsContainer");
  container.innerHTML = "";

  // Dynamic caret placement element
  const caret = document.createElement("div");
  caret.className = "caret";
  caret.id = "caret";
  container.appendChild(caret);

  // Group characters by word for DOM layout wrapping
  const wordsMap = {};
  charactersList.forEach((charObj, index) => {
    const wIdx = charObj.wordIndex;
    if (!wordsMap[wIdx]) wordsMap[wIdx] = [];
    wordsMap[wIdx].push({ charObj, index });
  });

  Object.keys(wordsMap).forEach(wIdx => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    wordSpan.id = `word-${wIdx}`;

    wordsMap[wIdx].forEach(item => {
      const charSpan = document.createElement("span");
      charSpan.className = "char";
      charSpan.id = `char-${item.index}`;
      
      // Store references directly on the object for O(1) rendering access
      item.charObj.el = charSpan;
      item.charObj.wordEl = wordSpan;
      
      // Represent spaces visually in DOM
      if (item.charObj.char === " ") {
        charSpan.innerHTML = "&nbsp;";
      } else {
        charSpan.textContent = item.charObj.char;
      }
      wordSpan.appendChild(charSpan);
    });

    container.appendChild(wordSpan);
  });

  positionCaret();
}

// Load the next chunk of words (prevents DOM bloating on 3000-word tests)
function loadNextWordChunk() {
  // Accumulate stats from the completed chunk
  accumulatedCorrectTypedChars += correctTypedChars;
  accumulatedTotalTypedChars += totalTypedChars;
  accumulatedErrorsCount += errorsCount;
  
  // Set up the next chunk of words
  const chunkWords = allSessionWords.slice(currentWordChunkOffset, currentWordChunkOffset + CHUNK_SIZE);
  currentWordChunkOffset += CHUNK_SIZE;
  
  // Flatten chunk words into charactersList
  charactersList = [];
  chunkWords.forEach((w, wIdx) => {
    for (let i = 0; i < w.length; i++) {
      charactersList.push({
        char: w[i],
        wordIndex: wIdx,
        status: "untyped"
      });
    }
    // Add space after word (except the last word)
    if (wIdx < chunkWords.length - 1) {
      charactersList.push({
        char: " ",
        wordIndex: wIdx,
        status: "untyped"
      });
    }
  });
  
  currentCharIndex = 0;
  correctTypedChars = 0;
  totalTypedChars = 0;
  errorsCount = 0;
  
  renderParagraph();
  highlightVirtualKey();
  
  // Reset scroll translation offset for the new chunk
  document.getElementById("wordsContainer").style.transform = "translateY(0)";
  
  // Clear hidden input field
  document.getElementById("hiddenInput").value = "";
}

// Position visual floating caret relative to active character
function positionCaret() {
  const container = document.getElementById("wordsContainer");
  const caret = document.getElementById("caret");
  
  if (currentCharIndex < charactersList.length) {
    const activeCharSpan = charactersList[currentCharIndex].el; // O(1) cached DOM ref
    if (activeCharSpan) {
      caret.style.left = `${activeCharSpan.offsetLeft}px`;
      caret.style.top = `${activeCharSpan.offsetTop + 4}px`;
      caret.style.height = `${activeCharSpan.offsetHeight * 0.85}px`;
      caret.style.display = "block";

      // Smooth scroll the words lines upwards if the active word goes out of bounds
      const wordSpan = activeCharSpan.parentElement;
      if (wordSpan && wordSpan.offsetTop > 120) {
        container.style.transform = `translateY(-${wordSpan.offsetTop - 50}px)`;
      } else {
        container.style.transform = "translateY(0)";
      }
    }
  } else {
    // Caret at the end of text
    const lastCharSpan = charactersList[charactersList.length - 1]?.el; // O(1) cached DOM ref
    if (lastCharSpan) {
      caret.style.left = `${lastCharSpan.offsetLeft + lastCharSpan.offsetWidth}px`;
      caret.style.top = `${lastCharSpan.offsetTop + 4}px`;
    }
  }
}

// Render the visual virtual keyboard according to selected mode
function renderKeyboardLayout() {
  const wrapper = document.getElementById("keyboardWrapper");
  wrapper.innerHTML = "";
  
  // Reset cache
  keyboardDomCache = {};

  KEYBOARD_ROWS.forEach(rowKeys => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "kb-row";

    rowKeys.forEach(keySymbol => {
      const keyDiv = document.createElement("div");
      keyDiv.className = "kb-key";
      keyDiv.dataset.key = keySymbol;
      
      // Store in cache
      keyboardDomCache[keySymbol] = keyDiv;

      // Handle legend label based on chosen layout
      const legends = KEY_LEGENDS[selectedLayout] || KEY_LEGENDS.english;
      
      if (legends[keySymbol]) {
        keyDiv.classList.add("key-double");
        
        const shiftCharSpan = document.createElement("span");
        shiftCharSpan.className = "key-shift-char";
        shiftCharSpan.textContent = legends[keySymbol][0];
        
        const normalCharSpan = document.createElement("span");
        normalCharSpan.className = "key-normal-char";
        normalCharSpan.textContent = legends[keySymbol][1];
        
        keyDiv.appendChild(shiftCharSpan);
        keyDiv.appendChild(normalCharSpan);
      } else {
        // Special button labels (Backspace, Space, Shift, Enter)
        keyDiv.textContent = keySymbol === "Space" ? "" : keySymbol;
      }

      rowDiv.appendChild(keyDiv);
    });

    wrapper.appendChild(rowDiv);
  });
}

// Map characters to keyboard keys visually to highlight what's next
function highlightVirtualKey() {
  // Remove existing highlights using O(1) direct reference if available
  if (lastHighlightedKeyEl) {
    lastHighlightedKeyEl.classList.remove("highlight-next");
    lastHighlightedKeyEl = null;
  }

  if (currentCharIndex >= charactersList.length) return;

  const nextChar = charactersList[currentCharIndex].char;
  
  // Find key legend matching this character
  const legends = KEY_LEGENDS[selectedLayout] || KEY_LEGENDS.english;
  let targetKeySymbol = null;

  if (nextChar === " ") {
    targetKeySymbol = "Space";
  } else {
    // Search in our key legends maps
    for (const [key, mapping] of Object.entries(legends)) {
      if (mapping[0] === nextChar || mapping[1] === nextChar) {
        targetKeySymbol = key;
        break;
      }
    }
  }

  if (targetKeySymbol) {
    const keyEl = keyboardDomCache[targetKeySymbol];
    if (keyEl) {
      keyEl.classList.add("highlight-next");
      lastHighlightedKeyEl = keyEl;
    }
  }
}

// Start Timer
function startTestTimer() {
  testActive = true;
  testStartTime = Date.now();

  if (isZenMode) {
    document.getElementById("statsHeader").style.opacity = "0.08";
  }

  testTimerInterval = setInterval(() => {
    if (testMode === "time") {
      timeRemaining--;
      if (timeRemaining <= 0) {
        completeTest();
      }
    } else {
      // Incremental time for word/untimed mode
      timeRemaining = Math.floor((Date.now() - testStartTime) / 1000);
    }
    updateStatsPanel();
  }, 1000);
}

// Live stats computations during run
function updateStatsPanel() {
  let elapsedMinutes = 1 / 60;
  
  if (testStartTime) {
    const elapsedSeconds = (Date.now() - testStartTime) / 1000;
    elapsedMinutes = Math.max(elapsedSeconds, 1) / 60;
  } else if (testMode === "time") {
    elapsedMinutes = timerDuration / 60;
  }

  const overallCorrect = accumulatedCorrectTypedChars + correctTypedChars;
  const overallTotal = accumulatedTotalTypedChars + totalTypedChars;

  const wpmVal = Math.round((overallCorrect / 5) / elapsedMinutes);
  const accVal = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 100;

  document.getElementById("liveWpm").textContent = wpmVal;
  document.getElementById("liveAcc").textContent = `${accVal}%`;
  document.getElementById("liveTime").textContent = `${timeRemaining}s`;
}

// Keystroke Handler (Intercepts events, transforms characters)
function handleKeydown(e) {
  const key = e.key;

  // Restart on Escape key
  if (key === "Escape") {
    e.preventDefault();
    const reportModal = document.getElementById("reportModalOverlay");
    if (reportModal && reportModal.classList.contains("open")) {
      reportModal.classList.remove("open");
    }
    resetTest();
    if (currentActivity === "game") {
      endGame(true);
      showGameStartScreen();
    } else {
      document.getElementById("hiddenInput").focus();
    }
    showToast("Practice restarted!");
    return;
  }

  // Ignore modifier keys
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  // Prevent browser scroll or keys inside inputs
  if (key === " " && currentCharIndex < charactersList.length) {
    e.preventDefault();
  }

  // Active click styling for keyboard visualizer using O(1) cache
  let targetKeySymbol = key === " " ? "Space" : key.toLowerCase();
  let keyEl = keyboardDomCache[targetKeySymbol] || keyboardDomCache[key];
  if (keyEl) {
    keyEl.classList.add("active-pressed");
    setTimeout(() => keyEl.classList.remove("active-pressed"), 100);
  }

  // Backspace handler
  if (key === "Backspace") {
    e.preventDefault();
    if (currentCharIndex > 0) {
      currentCharIndex--;
      const prevChar = charactersList[currentCharIndex];
      prevChar.status = "untyped";
      
      // Update visual styles using cached element
      if (prevChar.el) {
        prevChar.el.className = "char";
      }

      // If the word was red, clear error status on backspace using cached word element
      const wordSpan = prevChar.wordEl;
      if (wordSpan) {
        // Recalculate if there are still errors in this word
        const charsInWord = Array.from(wordSpan.querySelectorAll(".char"));
        const hasWordError = charsInWord.some(c => c.classList.contains("incorrect"));
        if (!hasWordError) {
          wordSpan.classList.remove("error-word");
        }
      }

      // If backspacing out of correct, decrement counter
      if (prevChar.status === "correct") {
        correctTypedChars = Math.max(0, correctTypedChars - 1);
      }
      totalTypedChars = Math.max(0, totalTypedChars - 1);

      playClickSound();
      positionCaret();
      highlightVirtualKey();
      updateStatsPanel();
    }
    return;
  }

  // Check if it is a single printable character key
  if (key.length === 1) {
    // Start timer on first keystroke
    if (!testActive && testStartTime === null) {
      startTestTimer();
    }

    // Strict Mode: Check if current char is already an error
    if (isStrictMode && currentCharIndex > 0) {
      const prevChar = charactersList[currentCharIndex - 1];
      if (prevChar && prevChar.status === "incorrect") {
        playErrorSound();
        if (keyEl) {
          keyEl.classList.add("highlight-error");
          setTimeout(() => keyEl.classList.remove("highlight-error"), 200);
        }
        e.preventDefault(); // Block typing until error is corrected
        return; 
      }
    }

    e.preventDefault();

    // Keyboard translation for Hindi Inscript
    let typedChar = key;
    if (selectedLanguage === "hindi") {
      typedChar = INSCRIPT_MAP[key] || key;
    }

    // Character comparison
    const targetCharObj = charactersList[currentCharIndex];
    if (!targetCharObj) return;

    totalTypedChars += typedChar.length;

    const isMatch = (typedChar === targetCharObj.char);

    if (isMatch) {
      playClickSound();
      targetCharObj.status = "correct";
      if (targetCharObj.el) targetCharObj.el.className = "char correct";
      correctTypedChars++;
      
      // If the word was red, clear error status on correction
      const wordSpan = targetCharObj.wordEl;
      if (wordSpan) {
        const charsInWord = Array.from(wordSpan.querySelectorAll(".char"));
        const hasWordError = charsInWord.some(c => c !== targetCharObj.el && c.classList.contains("incorrect"));
        if (!hasWordError) {
          wordSpan.classList.remove("error-word");
        }
      }
      
      currentCharIndex++;
    } else {
      playErrorSound();
      if (keyEl) {
        keyEl.classList.add("highlight-error");
        setTimeout(() => keyEl.classList.remove("highlight-error"), 200);
      }

      // Record mistake data for diagnostics
      const expectedChar = targetCharObj.char;
      keyMistakes[expectedChar] = (keyMistakes[expectedChar] || 0) + 1;
      errorsCount++;

      targetCharObj.status = "incorrect";
      if (targetCharObj.el) targetCharObj.el.className = "char incorrect";
      
      // Style parent word to reflect error boundary
      if (targetCharObj.wordEl) targetCharObj.wordEl.classList.add("error-word");
      
      // Do NOT increment currentCharIndex so they stay on this character until they type the correct key!
    }

    positionCaret();
    highlightVirtualKey();
    updateStatsPanel();

    // Check for chunk or test completion
    if (currentCharIndex >= charactersList.length) {
      if (currentWordChunkOffset < allSessionWords.length) {
        loadNextWordChunk();
      } else {
        completeTest();
      }
    }
  }
}

// End of session
function completeTest() {
  testActive = false;
  clearInterval(testTimerInterval);
  testTimerInterval = null;

  // Calculate final speeds
  const timeElapsed = testStartTime ? Math.max((Date.now() - testStartTime) / 1000, 1) : timerDuration;
  const elapsedMinutes = timeElapsed / 60;

  const overallCorrect = accumulatedCorrectTypedChars + correctTypedChars;
  const overallTotal = accumulatedTotalTypedChars + totalTypedChars;
  const overallErrors = accumulatedErrorsCount + errorsCount;

  // Gross WPM = (Total keystrokes / 5) / minutes
  const grossWpm = Math.round((overallTotal / 5) / elapsedMinutes);
  
  // Net WPM = ((Correct keystrokes) / 5) / minutes
  const netWpm = Math.max(0, Math.round((overallCorrect / 5) / elapsedMinutes));
  
  // Accuracy
  const finalAcc = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 100;

  // Save to History using localStorage helper
  saveRun(netWpm, finalAcc, selectedDifficulty, selectedLayout);
  
  // Update UI badge
  loadStreak();

  // Populate Report Modal
  document.getElementById("repWpm").textContent = netWpm;
  document.getElementById("repGrossWpm").textContent = `${grossWpm} gross`;
  document.getElementById("repAcc").textContent = `${finalAcc}%`;
  document.getElementById("repErrors").textContent = overallErrors;
  document.getElementById("repTime").textContent = `${Math.round(timeElapsed)}s`;

  // Mistakes keys list renderer
  const mistakesList = document.getElementById("mistakeKeysList");
  mistakesList.innerHTML = "";
  
  const sortedMistakes = Object.entries(keyMistakes).sort((a, b) => b[1] - a[1]);
  if (sortedMistakes.length > 0) {
    sortedMistakes.slice(0, 5).forEach(([key, val]) => {
      const badge = document.createElement("div");
      badge.className = "mistake-badge";
      badge.innerHTML = `Key <span>'${key === " " ? "Space" : key}'</span>: x${val} typos`;
      mistakesList.appendChild(badge);
    });
  } else {
    mistakesList.innerHTML = `<div class="mistake-badge" style="border-color: var(--correct-color); background: rgba(46,204,113,0.1);"><span style="color: var(--correct-color)">Perfect run! No mistakes.</span></div>`;
  }

  // Open modal
  document.getElementById("reportModalOverlay").classList.add("open");

  // Check Daily Goals celebration
  const targetGoal = getGoal();
  if (netWpm >= targetGoal.wpm && finalAcc >= targetGoal.accuracy) {
    playSuccessChime();
    triggerGoalConfetti();
    setTimeout(() => {
      showToast("Congratulations! You achieved your Daily Typing Goal! 🎉");
    }, 500);
  }
}

// Particle Canvas Confetti Celebration generator (100% offline-friendly)
function triggerGoalConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#66fcf1", "#ff007f", "#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6"];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  let animationFrameId = null;
  const start = Date.now();

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Stop after 4 seconds
    if (Date.now() - start > 4000) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrameId);
      return;
    }

    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();

      // Wrap particles around bounds
      if (p.y > canvas.height) {
        particles[idx] = {
          ...p,
          x: Math.random() * canvas.width,
          y: -20,
          tilt: Math.random() * 10 - 5
        };
      }
    });

    animationFrameId = requestAnimationFrame(drawConfetti);
  }

  drawConfetti();
}



// Populate the Lessons dropdown menu based on current language
function populateLessonsDropdown() {
  const select = document.getElementById("lessonSelect");
  if (!select) return;
  select.innerHTML = "";
  
  const list = selectedLanguage === "english" ? ENGLISH_LESSONS : HINDI_LESSONS;
  list.forEach((lesson, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = lesson.title;
    select.appendChild(opt);
  });
}

// Set active activity state: Test Mode vs Learn Mode vs Game Mode
function setActivityType(activity) {
  currentActivity = activity;
  
  const lessonConfig = document.getElementById("lessonConfig");
  const diffConfig = document.getElementById("diffConfig");
  const modeConfig = document.getElementById("modeConfig");
  const modeSettingsConfig = document.getElementById("modeSettingsConfig");
  const customTextConfig = document.getElementById("customTextConfig");
  const customTextInputArea = document.getElementById("customTextInputArea");
  
  const testAreaContainer = document.getElementById("testAreaContainer");
  const gameAreaContainer = document.getElementById("gameAreaContainer");

  // Terminate any active game session if they change activities
  if (gameActive) {
    endGame(true);
  }

  if (activity === "game") {
    if (lessonConfig) lessonConfig.style.display = "none";
    if (diffConfig) diffConfig.style.display = "none";
    if (modeConfig) modeConfig.style.display = "none";
    if (modeSettingsConfig) modeSettingsConfig.style.display = "none";
    if (customTextConfig) customTextConfig.style.display = "none";
    if (customTextInputArea) customTextInputArea.style.display = "none";
    
    if (testAreaContainer) testAreaContainer.style.display = "none";
    if (gameAreaContainer) gameAreaContainer.style.display = "flex";
    
    if (selectedLanguage === "english") {
      selectedLayout = "english";
    } else {
      selectedLayout = "inscript";
    }

    showGameStartScreen();
  } else if (activity === "learn") {
    if (testAreaContainer) testAreaContainer.style.display = "flex";
    if (gameAreaContainer) gameAreaContainer.style.display = "none";

    if (lessonConfig) lessonConfig.style.display = "block";
    if (diffConfig) diffConfig.style.display = "none";
    if (modeConfig) modeConfig.style.display = "none";
    if (modeSettingsConfig) modeSettingsConfig.style.display = "none";
    if (customTextConfig) customTextConfig.style.display = "none";
    if (customTextInputArea) customTextInputArea.style.display = "none";
    
    testMode = "untimed";
    populateLessonsDropdown();
    selectedLessonIndex = 0;
    const lessonSelect = document.getElementById("lessonSelect");
    if (lessonSelect) lessonSelect.value = 0;
    resetTest();
  } else {
    if (testAreaContainer) testAreaContainer.style.display = "flex";
    if (gameAreaContainer) gameAreaContainer.style.display = "none";

    if (lessonConfig) lessonConfig.style.display = "none";
    if (diffConfig) diffConfig.style.display = "block";
    if (modeConfig) modeConfig.style.display = "block";
    if (modeSettingsConfig) modeSettingsConfig.style.display = "block";
    if (customTextConfig) customTextConfig.style.display = "flex";
    
    const activeModeBtn = document.querySelector(".mode-btn.active");
    testMode = activeModeBtn ? activeModeBtn.dataset.mode : "time";
    
    const customToggle = document.getElementById("customTextToggle");
    if (customTextInputArea) {
      customTextInputArea.style.display = (customToggle && customToggle.checked) ? "flex" : "none";
    }
    resetTest();
  }
}

// Show initial Game screen state
function showGameStartScreen() {
  gameActive = false;
  
  const overlay = document.getElementById("gameOverlay");
  const title = document.getElementById("gameOverlayTitle");
  const desc = document.getElementById("gameOverlayDesc");
  const startBtn = document.getElementById("startGameBtn");
  const input = document.getElementById("gameInput");
  
  if (overlay) overlay.style.display = "flex";
  if (title) {
    title.textContent = "Word Invaders";
    title.style.color = "var(--accent-color)";
  }
  if (desc) desc.textContent = "Type the falling words before they hit the bottom of the screen. As your score increases, the words fall faster. Adjust language in the sidebar to practice English or Hindi Inscript words!";
  if (startBtn) startBtn.innerHTML = `<i class="fas fa-play"></i> Start Practice Game`;
  
  if (input) {
    input.value = "";
    input.disabled = true;
    input.placeholder = "Click 'Start Practice Game' to begin...";
  }
}

// Start Game practice loop
function startPracticeGame() {
  gameScore = 0;
  gameLevel = 1;
  gameLives = 3;
  gameActive = true;
  wordIdCounter = 0;
  
  // Clear any existing falling elements in DOM
  fallingWords.forEach(w => {
    if (w.el && w.el.parentNode) {
      w.el.parentNode.removeChild(w.el);
    }
  });
  fallingWords = [];
  
  // Reset scoreboard
  document.getElementById("gameScore").textContent = "0";
  document.getElementById("gameLevel").textContent = "1";
  document.getElementById("gameLives").textContent = "❤️❤️❤️";
  
  // Hide Overlay
  document.getElementById("gameOverlay").style.display = "none";
  
  // Enable input and focus
  const input = document.getElementById("gameInput");
  input.disabled = false;
  input.value = "";
  input.placeholder = "Type words here...";
  input.focus();
  
  // Clear any active loops
  clearInterval(gameTimerInterval);
  clearInterval(gameSpawnInterval);
  
  // Start animation loop (approx 30fps)
  gameTimerInterval = setInterval(updateGameFrame, 33);
  
  // Start word spawner loop
  gameSpawnInterval = setInterval(spawnGameWord, getSpawnDelay());
}

// Get interval delay for spawning words (shorter is faster)
function getSpawnDelay() {
  return Math.max(900, 3200 - gameLevel * 300);
}

// Spawn single word from the paragraph dictionary
function spawnGameWord() {
  if (!gameActive) return;
  
  const playfield = document.getElementById("gamePlayfield");
  if (!playfield) return;
  
  const wordText = getRandomWordForGame();
  
  const el = document.createElement("div");
  el.className = "falling-word";
  el.textContent = wordText;
  playfield.appendChild(el);
  
  // Compute details
  const elWidth = el.offsetWidth || 80;
  const xPercent = 10 + Math.random() * 80; // random coordinate (10% to 90%)
  const speed = 1.0 + (gameLevel * 0.25) + (Math.random() * 0.4); // word fall speed
  
  const wordObj = {
    id: wordIdCounter++,
    text: wordText,
    x: xPercent,
    y: 0,
    speed: speed,
    el: el
  };
  
  fallingWords.push(wordObj);
  
  // Set initial coordinates
  el.style.top = "0px";
  el.style.left = `calc(${xPercent}% - ${elWidth / 2}px)`;
}

// Select random word based on game level
function getRandomWordForGame() {
  const db = selectedLanguage === "english" ? ENGLISH_TEXTS : HINDI_TEXTS;
  let pool = db.easy;
  if (gameLevel >= 3 && gameLevel < 6) {
    pool = db.medium;
  } else if (gameLevel >= 6) {
    pool = db.hard;
  }
  
  const paragraph = pool[Math.floor(Math.random() * pool.length)];
  const words = paragraph.split(/\s+/);
  let word = words[Math.floor(Math.random() * words.length)];
  
  // Strip special symbols so the game stays fluent
  word = word.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()""'?|]+|[.,\/#!$%\^&\*;:{}=\-_`~()""'?|]+$/g, "");
  
  return word.trim() || (selectedLanguage === "english" ? "typing" : "टाइपिंग");
}

// Core game frame update loop
function updateGameFrame() {
  if (!gameActive) return;
  
  const playfield = document.getElementById("gamePlayfield");
  if (!playfield) return;
  const limitY = playfield.clientHeight - 40; // bottom threshold
  
  for (let i = fallingWords.length - 1; i >= 0; i--) {
    const word = fallingWords[i];
    word.y += word.speed;
    word.el.style.top = word.y + "px";
    
    // Check bottom boundary hit
    if (word.y >= limitY) {
      playErrorSound();
      
      // Remove element from screen
      if (word.el && word.el.parentNode) {
        word.el.parentNode.removeChild(word.el);
      }
      fallingWords.splice(i, 1);
      
      // Deduct life
      gameLives--;
      updateLivesDisplay();
      
      if (gameLives <= 0) {
        triggerGameOver();
        break;
      }
    }
  }
}

// Draw game lives hearts
function updateLivesDisplay() {
  const livesContainer = document.getElementById("gameLives");
  if (!livesContainer) return;
  
  let hearts = "";
  for (let i = 0; i < 3; i++) {
    hearts += i < gameLives ? "❤️" : "🖤";
  }
  livesContainer.textContent = hearts;
}

// Game Over execution
function triggerGameOver() {
  gameActive = false;
  clearInterval(gameTimerInterval);
  clearInterval(gameSpawnInterval);
  
  const input = document.getElementById("gameInput");
  if (input) {
    input.value = "";
    input.disabled = true;
    input.placeholder = "Game Over!";
  }
  
  // Show modal game over screen
  const overlay = document.getElementById("gameOverlay");
  const title = document.getElementById("gameOverlayTitle");
  const desc = document.getElementById("gameOverlayDesc");
  const startBtn = document.getElementById("startGameBtn");
  
  if (overlay) overlay.style.display = "flex";
  if (title) {
    title.textContent = "Game Over 💀";
    title.style.color = "#e74c3c";
  }
  if (desc) desc.innerHTML = `Nice effort! Your final score is <strong style="color: var(--accent-color); font-size: 1.25rem;">${gameScore}</strong> points at Level <strong>${gameLevel}</strong>. Try again to improve!`;
  if (startBtn) startBtn.innerHTML = `<i class="fas fa-redo"></i> Play Again`;
}

// Quit/Exit Game Execution
function endGame(isQuit = false) {
  gameActive = false;
  clearInterval(gameTimerInterval);
  clearInterval(gameSpawnInterval);
  
  const input = document.getElementById("gameInput");
  if (input) {
    input.value = "";
    input.disabled = true;
  }
  
  // Clear any floating words from DOM
  fallingWords.forEach(w => {
    if (w.el && w.el.parentNode) {
      w.el.parentNode.removeChild(w.el);
    }
  });
  fallingWords = [];
  
  showGameStartScreen();
}

// Real-time matched prefix highlighting
function checkGameWordPrefix(val) {
  if (!gameActive) return;
  
  // Highlight prefix on falling words in playfield
  fallingWords.forEach(word => {
    if (val.length > 0 && word.text.startsWith(val)) {
      word.el.innerHTML = `<span class="matched-prefix">${val}</span>${word.text.substring(val.length)}`;
    } else {
      word.el.innerHTML = word.text;
    }
  });
  
  // Immediate popup if fully typed
  const matchIndex = fallingWords.findIndex(w => w.text === val);
  if (matchIndex !== -1) {
    popGameWord(matchIndex);
  }
}

// Check game word matching on Space/Enter key hits
function checkGameWordMatch(val) {
  const matchIndex = fallingWords.findIndex(w => w.text === val);
  if (matchIndex !== -1) {
    popGameWord(matchIndex);
  } else {
    // Flash field red on mistyped submit
    playErrorSound();
    const input = document.getElementById("gameInput");
    input.style.borderColor = "#e74c3c";
    setTimeout(() => {
      input.style.borderColor = gameActive ? "var(--accent-color)" : "var(--panel-border)";
    }, 200);
  }
}

// Pop word particle explosion execution
function popGameWord(index) {
  const word = fallingWords[index];
  if (!word) return;
  
  playClickSound();
  
  // Class pop trigger
  word.el.classList.add("exploding");
  
  // Splice from active loop checks
  fallingWords.splice(index, 1);
  
  // Delete from screen
  setTimeout(() => {
    if (word.el && word.el.parentNode) {
      word.el.parentNode.removeChild(word.el);
    }
  }, 300);
  
  const input = document.getElementById("gameInput");
  if (input) input.value = "";
  
  // Reset other prefixes
  fallingWords.forEach(w => {
    w.el.innerHTML = w.text;
  });
  
  // Score computing
  gameScore += 10;
  
  const newLevel = Math.floor(gameScore / 100) + 1;
  if (newLevel > gameLevel) {
    gameLevel = newLevel;
    showToast(`Level Up! Level ${gameLevel} 🎉`);
    
    // Spawn faster
    clearInterval(gameSpawnInterval);
    gameSpawnInterval = setInterval(spawnGameWord, getSpawnDelay());
  }
  
  document.getElementById("gameScore").textContent = gameScore;
  document.getElementById("gameLevel").textContent = gameLevel;
}
