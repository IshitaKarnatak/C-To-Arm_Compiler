from flask import Flask, request, jsonify
import subprocess
import os
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins, adjust if needed

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INPUT_DIR = os.path.join(BASE_DIR, "input")
OUTPUT_FILE = os.path.join(BASE_DIR, "armv8_output.s")

@app.route('/compile', methods=['POST'])
def compile_code():
    print("Received a request at /compile")  # Debug log

    data = request.get_json()
    print("Request JSON data:", data)  # Debug log

    code = data.get('code', '')

    # Generate unique filename for input source
    temp_filename = f"input_temp_{uuid.uuid4().hex}.c"
    temp_filepath = os.path.join(INPUT_DIR, temp_filename)

    # Save the input code to file
    try:
        with open(temp_filepath, 'w') as f:
            f.write(code)
        print(f"Saved input code to {temp_filepath}")  # Debug log
    except Exception as e:
        print(f"Error saving input file: {e}")
        return jsonify({"output": f"Failed to save input file: {e}", "success": False}), 500

    # Run your compiler.py on the saved file
    cmd = ['python', os.path.join(BASE_DIR, "compiler.py"), temp_filepath]
    print(f"Running command: {' '.join(cmd)}")  # Debug log

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("Compilation successful")  # Debug log
        print("Compiler stdout:", result.stdout)
        print("Compiler stderr:", result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Compilation failed: {e.stderr}")
        # Cleanup input file on error
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        return jsonify({"output": f"Compilation failed:\n{e.stderr}", "success": False}), 400

    # Read the ARMv8 output file
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                output_asm = f.read()
            print(f"Read output file {OUTPUT_FILE}")  # Debug log
        except Exception as e:
            output_asm = f"Failed to read output file: {e}"
            print(output_asm)
    else:
        output_asm = "ARMv8 output file not found."
        print(output_asm)

    # Cleanup input file
    if os.path.exists(temp_filepath):
        os.remove(temp_filepath)
        print(f"Deleted input file {temp_filepath}")

    return jsonify({"output": output_asm, "success": True})

if __name__ == "__main__":
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"Created input directory {INPUT_DIR}")

    app.run(host="0.0.0.0", port=5000, debug=True)
