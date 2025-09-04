// Pakai stationsList dari stations.js
let audio = document.getElementById("radio");
let stationSelect = document.getElementById("stations");
let playBtn = document.getElementById("playBtn");
let pauseBtn = document.getElementById("pauseBtn");
let muteBtn = document.getElementById("muteBtn");
let volumeSlider = document.getElementById("volume");
let status = document.getElementById("status");
let visualizerCanvas = document.getElementById("visualizer");
let ctx = visualizerCanvas.getContext("2d");

let hls;
let currentStationIndex = -1;
let isMuted = false;

// Isi dropdown dengan daftar station
function populateDropdown() {
  stationSelect.innerHTML = "";
  stationsList.forEach((st, index) => {
    let opt = document.createElement("option");
    opt.value = index;
    opt.textContent = st.name;
    stationSelect.appendChild(opt);
  });
}

// Load station
function loadStation(index) {
  if (hls) {
    hls.destroy();
    hls = null;
  }
  audio.src = "";
  audio.pause();

  let station = stationsList[index];
  currentStationIndex = index;
  status.textContent = "Loading: " + station.name;

  if (station.url.includes(".m3u8")) {
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(station.url);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.play();
        status.textContent = "Now Playing: " + station.name;
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = station.url;
      audio.play();
      status.textContent = "Now Playing: " + station.name;
    } else {
      alert("Browser tidak mendukung HLS untuk " + station.name);
    }
  } else {
    audio.src = station.url;
    audio.play()
      .then(() => {
        status.textContent = "Now Playing: " + station.name;
      })
      .catch(err => {
        console.error("Error play:", err);
        alert("Gagal memutar: " + station.name);
      });
  }
}

// Event tombol
playBtn.addEventListener("click", () => {
  if (currentStationIndex === -1 && stationSelect.value) {
    loadStation(stationSelect.value);
  } else {
    audio.play();
    status.textContent = "Now Playing: " + stationsList[currentStationIndex].name;
  }
});

pauseBtn.addEventListener("click", () => {
  audio.pause();
  status.textContent = "Paused";
});

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.innerHTML = isMuted
    ? '<i class="fas fa-volume-up"></i>'
    : '<i class="fas fa-volume-mute"></i>';
});

volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});

// Event dropdown
stationSelect.addEventListener("change", (e) => {
  let index = parseInt(e.target.value);
  loadStation(index);
});

// Visualizer
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
let source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;
let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

  let barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    let barHeight = dataArray[i] / 2;
    ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
    ctx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}
drawVisualizer();

// Init
populateDropdown();
status.textContent = "Select a station to play";
