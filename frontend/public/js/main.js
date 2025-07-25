// Show selected file name
document.getElementById("audioFile").addEventListener("change", function () {
  const fileName = this.files[0] ? this.files[0].name : "No file selected";
  document.getElementById("fileName").textContent = fileName;
});

// Handle Generate button click
document
  .getElementById("generateBtn")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("audioFile");
    const file = fileInput.files[0];
    const loadingMessage = document.getElementById("loadingMessage");
    const resultBox = document.getElementById("resultBox");
    const resultText = document.getElementById("resultText");

    if (!file) {
      alert("Please select an audio file.");
      return;
    }

    // Show loading message and hide previous results
    loadingMessage.style.display = "inline-flex";
    resultBox.style.display = "none";

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response JSON:", data);

      if (data.error) {
        resultText.innerHTML = `<span class="error">❌ ${data.error}</span>`;
      } else {
        resultText.innerHTML = `
        <div class="output-block">
          <h3>🗣 Transcription</h3>
          <p class="justified-text">${data.transcription}</p>
        </div>

        <div class="output-block">
          <h3>📄 SOAP Note</h3>
          ${formatSOAP(data.soap_note)}
        </div>

        <div class="output-block">
          <h3>📝 Brief Summary</h3>
          <p class="justified-text">${escapeHTML(data.summary || "No summary available.")}</p>
        </div>
      `;
      }

      resultBox.style.display = "block";
    } catch (err) {
      alert("Something went wrong while contacting the server: " + err.message);
      console.error(err);
    } finally {
      // Always hide loading message after request finishes
      loadingMessage.style.display = "none";
    }
  });

// Format SOAP note with headings
function formatSOAP(soapText) {
  if (!soapText) return "<p>No SOAP note available.</p>";

  return soapText
    .replace(/(Subjective:)/gi, '<h4 style="text-align: left;">$1</h4>')
    .replace(/(Objective:)/gi, '<h4 style="text-align: left;">$1</h4>')
    .replace(/(Assessment:)/gi, '<h4 style="text-align: left;">$1</h4>')
    .replace(/(Plan:)/gi, '<h4 style="text-align: left;">$1</h4>')
    .replace(/\n/g, "<br>");
}

// Prevent XSS by escaping HTML
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const recordBtn = document.getElementById("recordToggleBtn");
const audioPreviewContainer = document.getElementById("audioPreviewContainer");
const audioPreview = document.getElementById("recordedAudio");
const fileInfo = document.getElementById("recordedFileInfo");
const fileInput = document.getElementById("audioFile"); // For uploading

let mediaRecorder;
let isRecording = false;
let recordedChunks = [];

recordBtn.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      recordedChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks, { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], "recorded_audio.mp3", {
          type: "audio/mp3",
        });

        // Show preview
        audioPreview.src = audioUrl;
        fileInfo.textContent = `Filename: ${file.name}`;
        audioPreviewContainer.style.display = "block";

        // Set the hidden input for upload
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        document.getElementById("fileName").textContent = file.name;
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtn.textContent = "🛑 Stop Recording";
    } catch (err) {
      alert("Microphone permission denied or not supported.");
      console.error("Error accessing microphone:", err);
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.textContent = "🎙 Start Recording";
  }
});

function formatTranscription(text) {
  if (!text) return "";

  // First escape HTML
  let escapedText = escapeHTML(text);

  // Replace Doctor: (case insensitive, with optional trailing punctuation)
  escapedText = escapedText.replace(/(doctor)([:.,]?)/gi, (match, p1, p2) => {
    return `<span class="doctor-label">${
      p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase()
    }:</span>`;
  });

  // Replace Patient: (case insensitive, with optional trailing punctuation)
  escapedText = escapedText.replace(/(patient)([:.,]?)/gi, (match, p1, p2) => {
    return `<span class="patient-label">${
      p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase()
    }:</span>`;
  });

  // Replace newlines with <br> so breaks stay in HTML
  escapedText = escapedText.replace(/\n/g, "<br>");

  return escapedText;
}