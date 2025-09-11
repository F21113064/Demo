from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import PyPDF2
import json
import tempfile
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Global variable to store extracted text and metadata
current_pdf_data = {
    'text': '',
    'pages': [],
    'filename': ''
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from PDF
        try:
            text_data = extract_text_from_pdf(filepath)
            current_pdf_data.update(text_data)
            current_pdf_data['filename'] = filename
            
            return jsonify({
                'success': True,
                'filename': filename,
                'pages': len(current_pdf_data['pages'])
            })
        except Exception as e:
            return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Please upload a PDF file.'}), 400

@app.route('/search', methods=['POST'])
def search():
    query = request.json.get('query', '').lower().strip()
    if not query or not current_pdf_data['text']:
        return jsonify({'results': []})
    
    results = []
    pages = current_pdf_data['pages']
    
    for page_num, page_text in enumerate(pages, 1):
        page_text_lower = page_text.lower()
        if query in page_text_lower:
            # Find all occurrences in this page
            start = 0
            while True:
                index = page_text_lower.find(query, start)
                if index == -1:
                    break
                
                # Get context around the match
                context_start = max(0, index - 50)
                context_end = min(len(page_text), index + len(query) + 50)
                context = page_text[context_start:context_end]
                
                results.append({
                    'page': page_num,
                    'context': context,
                    'position': index
                })
                start = index + 1
    
    return jsonify({'results': results[:50]})  # Limit to 50 results

@app.route('/pdf/<filename>')
def serve_pdf(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def extract_text_from_pdf(filepath):
    """Extract text from PDF file page by page"""
    text_data = {'text': '', 'pages': []}
    
    with open(filepath, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            text_data['pages'].append(page_text)
            text_data['text'] += page_text + '\n'
    
    return text_data

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)