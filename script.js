const stationsDropdown = document.getElementById("stations");
const statusText = document.getElementById("status");
const audio = document.getElementById("radio");

let currentStations = stationsSource1; // default Source 1

function loadStations(list) {
  stationsDropdown.innerHTML = "";
  list.forEach((station, idx) => {
    const option = document.createElement("option");
    option.value = station.url;
    option.textContent = station.name;
    if (idx === 0) option.selected = true;
    stationsDropdown.appendChild(option);
  });
}

// Load awal
loadStations(currentStations);

// Ganti source
document.querySelectorAll("input[name='source']").forEach(radio => {
  radio.addEventListener("change", e => {
    currentStations = e.target.value === "1" ? stationsSource1 : stationsSource2;
    loadStations(currentStations);
    statusText.textContent = "Source changed. Select a station to play.";
    audio.pause();
  });
});

// Play & Pause
document.getElementById("playBtn").addEventListener("click", () => {
  const url = stationsDropdown.value;
  if (Hls.isSupported() && url.endsWith(".m3u8")) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(audio);
  } else {
    audio.src = url;
  }
  audio.play();
  statusText.textContent = "Now Playing: " + stationsDropdown.selectedOptions[0].textContent;
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  audio.pause();
  statusText.textContent = "Paused";
});

// Volume & Mute
document.getElementById("volume").addEventListener("input", e => {
  audio.volume = e.target.value;
});

document.getElementById("muteBtn").addEventListener("click", () => {
  audio.muted = !audio.muted;
  statusText.textContent = audio.muted ? "Muted" : "Unmuted";
});
