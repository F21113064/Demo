# PDF Viewer with Smart Search

A modern web application for viewing PDF files with intelligent search capabilities.

## Features

- **PDF Upload**: Easy drag-and-drop or click-to-upload PDF files
- **Split-Screen Layout**: PDF viewer on the left, search panel on the right
- **Smart Search**: Full-text search with contextual results and highlighting
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Results**: Instant search results with page references

## Technology Stack

- **Backend**: Flask 2.3.3, PyPDF2 3.0.1, Werkzeug 2.3.7
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Display**: Browser's built-in PDF viewer

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Demo
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

1. **Upload a PDF**: Click "Choose File" or drag and drop a PDF file
2. **View PDF**: The PDF will display in the left panel
3. **Search Content**: Enter search terms in the right panel
4. **Navigate Results**: Click on search results to find relevant content

## API Endpoints

- `GET /` - Main application interface
- `POST /upload` - Upload PDF file
- `POST /search` - Search PDF content
- `GET /pdf/<filename>` - Serve uploaded PDF files

## File Structure

```
/
├── static/
│   ├── css/
│   │   └── style.css      # Application styling
│   └── js/
│       └── main.js        # Frontend functionality
├── templates/
│   └── index.html         # Main HTML template
├── uploads/               # Uploaded PDF files (auto-created)
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Search Features

- **Full-text search** across all pages
- **Context preview** with highlighted matches
- **Page references** for easy navigation
- **Case-insensitive** search
- **Real-time results** as you type

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available under the MIT License.