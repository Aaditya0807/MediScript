
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import librosa
import textwrap
import re

# --- 1. Model Loading ---
# Setup device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# ASR Pipeline (Whisper)
asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-tiny",
    device=device
)

# LLM Pipeline (Qwen)
# We load the tokenizer and model, which is more flexible than a pipeline
llm_tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen1.5-0.5B-Chat")
llm_model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen1.5-0.5B-Chat",
    torch_dtype="auto",  # Use appropriate precision
    device_map="auto"    # Let transformers handle device placement
)

# Note: The 'summarizer' pipeline has been removed as the LLM can handle this task.


# --- 2. Processing Function ---
def process_audio(audio_file):
    if audio_file is None:
        return "Please provide an audio file.", "", ""


# Step 1: Transcription
    try:
        speech, _ = librosa.load(audio_file, sr=16000, mono=True)
        transcription_result = asr_pipeline(speech, chunk_length_s=30, return_timestamps=False)
        transcription = transcription_result["text"].strip()

        # Normalize labels: Replace doctor/patient + punctuation with colon
        transcription = re.sub(r'\bdoctor[.,]?', 'Doctor:', transcription, flags=re.IGNORECASE)
        transcription = re.sub(r'\bpatient[.,]?', 'Patient:', transcription, flags=re.IGNORECASE)

        # Insert newline before each speaker (except start)
        transcription = re.sub(r'(?<!^)(\bDoctor:)', r'\n\1', transcription)
        transcription = re.sub(r'(?<!^)(\bPatient:)', r'\n\1', transcription)

        # Format speaker labels as colored spans for HTML
        transcription = transcription.replace(
            "Doctor:", '<span class="doctor-label">Doctor:</span>'
        ).replace(
            "Patient:", '<span class="patient-label">Patient:</span>'
        )

        # Replace newlines with <br> for HTML display
        transcription = transcription.replace('\n', '<br>')

    except Exception as e:
        return f"Error during audio processing: {e}", "", ""

    if not transcription:
        return "Audio was silent or could not be transcribed.", "N/A", "N/A"

    # --- Step 2: Generate SOAP Note using Qwen's Chat Template ---
    messages = [
            {"role": "system", "content": "You are a helpful medical assistant. Generate a structured S.O.A.P. (Subjective, Objective, Assessment, Plan) clinical note based on the user's transcription. The output should be clear, concise, and formatted correctly with the four sections."},
            {"role": "user", "content": transcription}
        ]
    prompt = llm_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    inputs = llm_tokenizer(prompt, return_tensors="pt").to(device)
    input_ids_length = inputs.input_ids.shape[1] # Get the length of the prompt

    outputs = llm_model.generate(**inputs, max_new_tokens=512, do_sample=True, temperature=0.3, top_p=0.8)

        # Decode only the newly generated tokens, not the prompt
    response_ids = outputs[0][input_ids_length:]
    soap_note = llm_tokenizer.decode(response_ids, skip_special_tokens=True)
        
        # Wrap text for justified formatting
    soap_note = f'<div style="text-align: justify;">{soap_note}</div>'


    # --- Step 3: Generate Summary using the same LLM ---
    summary_messages = [
        {"role": "system", "content": "You are a summarization assistant. Provide a concise, one-paragraph summary of the following medical transcription."},
        {"role": "user", "content": transcription}
    ]
    summary_prompt = llm_tokenizer.apply_chat_template(summary_messages, tokenize=False, add_generation_prompt=True)

    summary_inputs = llm_tokenizer(summary_prompt, return_tensors="pt").to(device)
    summary_input_length = summary_inputs.input_ids.shape[1]

    summary_outputs = llm_model.generate(**summary_inputs, max_new_tokens=150, do_sample=False)
    summary_response_ids = summary_outputs[0][summary_input_length:]
    summary = llm_tokenizer.decode(summary_response_ids, skip_special_tokens=True)

    return transcription, soap_note, summary

if __name__ == "__main__":
    # To run this, you'll need these packages:
    # pip install gradio torch transformers librosa soundfile accelerate sentencepiece
    demo.launch() # type: ignore