from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import tempfile
import os
import logging

app = Flask(__name__)
# Configure CORS for development
CORS(app, resources={
    r"/extract-text": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "service": "PDF Text Extractor"})

@app.route('/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        logger.error("No file part in request")
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        logger.error("Empty filename received")
        return jsonify({"error": "No file selected"}), 400
    
    try:
        logger.info(f"Processing file: {file.filename}")
        
        # Save the file temporarily
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        
        # Extract text from PDF
        text = ""
        try:
            reader = PdfReader(temp_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            logger.info(f"Successfully extracted text from {file.filename}")
        except Exception as e:
            logger.error(f"PDF extraction failed: {str(e)}")
            raise
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify({
            "success": True,
            "text": text,
            "filename": file.filename
        })
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        # Clean up if temp file exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({
            "error": "Failed to process PDF",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)