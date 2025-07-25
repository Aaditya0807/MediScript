# MediScript 🩺✨

MediScript is an AI-powered tool designed to streamline medical documentation by automatically generating SOAP notes, transcribing doctor-patient conversations, and providing concise summaries from an audio source.

## Key Features

* **Automated SOAP Note Generation**: Creates structured clinical notes in the Subjective, Objective, Assessment, and Plan (SOAP) format.
* **Full Audio Transcription**: Provides a complete, written transcript of doctor-patient conversations.
* **AI-Powered Summarization**: Generates a brief and accurate summary of the key points from the discussion.
* **Flexible Input Methods**: Supports both file uploads and real-time audio recording directly in the browser.

## Tech Stack 🛠️

* **AI Backend**: Python, Flask, PyTorch, Hugging Face Transformers
* **Node Server**: Node.js, Express.js
* **Frontend**: EJS, HTML, CSS, JavaScript
* **Audio Processing**: Librosa, FFmpeg

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### Prerequisites

Make sure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (which includes npm)
* [Python](https://www.python.org/downloads/) (version 3.8 or higher)
* [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Aaditya0807/MediScript.git](https://github.com/Aaditya0807/MediScript.git)
    cd MediScript
    ```

2.  **Set up the Python AI Backend:**
    *(This server handles the core AI and transcription tasks.)*
    ```sh
    pip install -r requirements.txt
    ```

3.  **Set up the Node.js Server:**
    *(This server handles the user interface and file operations.)*
    In the root project directory (`MediScript`), run:
    ```sh
    cd node_server
    npm install
    ```

### Running the Application 🚀

You need to run **two** terminal sessions simultaneously to start both servers.

1.  **Start the Python Backend Server:**
    Open a terminal, navigate to the `backend` folder, and run:
    ```sh
    cd backend
    python app.py
    ```

2.  **Start the Node.js Server:**
    Open a **new** terminal, navigate to the `node_server` folder, and run:
    ```sh
    cd node_server
    node server.js
    ```

3.  **Access the application:**
    Open your web browser and go to `http://localhost:3000` (or whichever port your Node server is configured to use).

## How to Use

1.  Navigate to the application URL in your browser.
2.  You will see two options:
    * **Upload an audio file**: Choose a pre-recorded audio file from your device.
    * **Record in real-time**: Click the record button to start a new recording.
3.  After the audio is processed, the generated SOAP notes, full transcription, and summary will be displayed on the screen.


## Authors & Contributors 🤝

This project was brought to life by the collaborative effort of:

* **Aaditya** - [GitHub: Aaditya0807](https://github.com/Aaditya0807)
* **Peeyush** - [GitHub: peeyushdutt01](https://github.com/peeyushdutt01)
* **Sanjana Sharma** - [GitHub: sanjana762](https://github.com/sanjana762)
* **Krishna Rohilla** - [GitHub: krish-9085](https://github.com/krish-9085)
* **Mehak** - [GitHub: Mehakaggarwal24](https://github.com/Mehakaggarwal24)

## License

Distributed under the MIT License. See `LICENSE` for more information.

