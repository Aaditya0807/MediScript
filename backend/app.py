from flask import Flask, request, jsonify
from python_model.model import process_audio
import os

app = Flask(__name__)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    file = request.files.get('audio')
    if file is None:
        return jsonify({'error': 'No file provided'}), 400

    file_path = f"temp_{file.filename}"
    file.save(file_path)

    try:
        transcription, soap_note, summary = process_audio(file_path)
        os.remove(file_path)
        return jsonify({
            'transcription': transcription,
            'soap_note': soap_note,
            'summary': summary
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
