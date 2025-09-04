const stationsDropdown = document.getElementById("stations");
const statusText = document.getElementById("status");
const audio = document.getElementById("radio");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let currentStations = stationsSource1; // default Source 1
let currentSource = "1";
let audioCtx, analyser, source, dataArray;

// ====== Load Stations ke Dropdown ======
function loadStations(list, sourceId) {
  stationsDropdown.innerHTML = "";

  if (sourceId === "1") {
    // langsung tanpa grouping (Indonesia semua)
    list.forEach(st => {
      const option = document.createElement("option");
      option.value = st.url;
      option.textContent = st.name;
      stationsDropdown.appendChild(option);
    });
  } else {
    // grouping per negara
    const grouped = {};
    list.forEach(st => {
      if (!grouped[st.country]) grouped[st.country] = [];
      grouped[st.country].push(st);
    });

    for (const country in grouped) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = country;
      grouped[country].forEach(st => {
        const option = document.createElement("option");
        option.value = st.url;
        option.textContent = st.name;
        optgroup.appendChild(option);
      });
      stationsDropdown.appendChild(optgroup);
    }
  }
}

// Load awal
loadStations(currentStations, currentSource);

// ====== Ganti Source (Indonesia / Luar Negeri) ======
document.querySelectorAll("input[name='source']").forEach(radio => {
  radio.addEventListener("change", e => {
    currentSource = e.target.value;
    currentStations = currentSource === "1" ? stationsSource1 : stationsSource2;
    loadStations(currentStations, currentSource);
    statusText.textContent = "Source changed. Select a station to play.";
    audio.pause();
  });
});

// ====== Play ======
document.getElementById("playBtn").addEventListener("click", () => {
  const url = stationsDropdown.value;

  if (Hls.isSupported() && url.endsWith(".m3u8")) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(audio);
  } else {
    audio.src = url;
  }

  audio.play()
    .then(() => {
      statusText.textContent = "Now Playing: " + stationsDropdown.selectedOptions[0].textContent;
      initVisualizer();
    })
    .catch(err => {
      console.error("Play error:", err);
      statusText.textContent = "⚠️ Error playing station.";
    });
});

// ====== Pause ======
document.getElementById("pauseBtn").addEventListener("click", () => {
  audio.pause();
  statusText.textContent = "Paused";
});

// ====== Volume & Mute ======
document.getElementById("volume").addEventListener("input", e => {
  audio.volume = e.target.value;
});

document.getElementById("muteBtn").addEventListener("click", (e) => {
  audio.muted = !audio.muted;
  const icon = e.currentTarget.querySelector("i");
  if (audio.muted) {
    icon.classList.remove("fa-volume-up");
    icon.classList.add("fa-volume-mute");
    statusText.textContent = "Muted";
  } else {
    icon.classList.remove("fa-volume-mute");
    icon.classList.add("fa-volume-up");
    statusText.textContent = "Unmuted";
  }
});

// ====== Visualizer ======
function initVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
  drawVisualizer();
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "#3e2723"; // coklat tua background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / dataArray.length) * 2.5;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = dataArray[i];

    // gradasi coklat ke emas
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ffd700"); // emas
    gradient.addColorStop(1, "#8d6e63"); // coklat muda

    ctx.fillStyle = gradient;
    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
    x += barWidth + 1;
  }
}

// Resize canvas otomatis
window.addEventListener("resize", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = 150;
});
window.dispatchEvent(new Event("resize"));
