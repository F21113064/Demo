# PDF Image Search Application

A modern web application for searching images within PDF documents using advanced computer vision techniques.

## Features

### Core Functionality
- **Multi-scale Template Matching**: Search for images at different scales for robust matching
- **Image Preprocessing**: Automatic image enhancement for better matching accuracy
- **Progress Tracking**: Real-time progress updates during search operations
- **Comprehensive Error Handling**: Robust validation and error reporting
- **Asynchronous Processing**: Non-blocking search operations with background processing

### Image Processing Enhancements
1. **Image Preprocessing**:
   - Automatic resize to manageable sizes
   - Grayscale conversion and normalization
   - Gaussian blur for noise reduction
   - Edge detection optimization

2. **Multi-scale Template Matching**:
   - Search at scales: 0.5x, 0.7x, 0.85x, 1.0x, 1.2x, 1.5x, 2.0x
   - Image pyramid implementation for faster processing
   - Dynamic threshold adjustment
   - Non-maximum suppression to remove overlapping matches

3. **Error Handling & Validation**:
   - File type validation (PDF and image formats)
   - File size limits (50MB for PDFs, 10MB for images)
   - Empty file detection
   - Comprehensive error messages
   - Dependency checking

4. **Progress Tracking**:
   - Page-by-page processing updates
   - Match count tracking
   - Status reporting (starting, processing, completed, error)
   - Timeout handling

## API Endpoints

### Main Search Endpoint
```
POST /search_image_pdf
```

**Parameters:**
- `pdf_file`: PDF file to search within (multipart/form-data)
- `image_file`: Template image to search for (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "task_id": "task_1234567890",
  "message": "Search started successfully"
}
```

### Progress Tracking
```
GET /progress/<task_id>
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "status": "processing",
    "progress": 60,
    "message": "Processing page 3 of 5...",
    "total_pages": 5,
    "current_page": 3,
    "matches_found": 2,
    "matches": [...]
  }
}
```

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890.123
}
```

## Installation

### Requirements
- Python 3.8+
- pip

### Dependencies
```bash
pip install flask opencv-python PyMuPDF Pillow numpy
```

### Quick Start
1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `python app.py`
4. Open your browser to `http://localhost:5000`

## Usage

### Web Interface
1. Navigate to the main page
2. Upload a PDF file (max 50MB)
3. Upload an image template to search for
4. Click "Start Search" to begin processing
5. Monitor progress in real-time
6. View detailed results when complete

### API Usage
```python
import requests

# Start search
files = {
    'pdf_file': open('document.pdf', 'rb'),
    'image_file': open('template.png', 'rb')
}
response = requests.post('http://localhost:5000/search_image_pdf', files=files)
task_id = response.json()['task_id']

# Check progress
progress_response = requests.get(f'http://localhost:5000/progress/{task_id}')
progress = progress_response.json()['progress']
```

## Architecture

### Core Components

1. **ImageSearcher Class**:
   - Main processing engine
   - Handles image preprocessing and template matching
   - Manages progress tracking

2. **Flask Web Application**:
   - RESTful API endpoints
   - File upload handling
   - Asynchronous task management

3. **Frontend Interface**:
   - Bootstrap-based responsive UI
   - Real-time progress updates
   - Results visualization

### Processing Pipeline

1. **File Validation**: Check file types, sizes, and dependencies
2. **Image Preprocessing**: Convert to grayscale, normalize, and enhance
3. **PDF Processing**: Extract pages as high-resolution images
4. **Multi-scale Matching**: Search template at multiple scales
5. **Results Filtering**: Remove overlapping matches using NMS
6. **Progress Reporting**: Update status throughout processing

## Technical Details

### Image Processing
- **OpenCV**: For computer vision operations
- **PyMuPDF**: For PDF page extraction and rendering
- **Pillow**: For image format handling
- **NumPy**: For numerical computations

### Template Matching Algorithm
1. Create image pyramid for template at different scales
2. Apply template matching using normalized cross-correlation
3. Find locations above confidence threshold
4. Apply non-maximum suppression to remove overlaps
5. Return matches with position, size, confidence, and scale

### Performance Optimizations
- Multi-scale processing for faster matching
- Image preprocessing to improve accuracy
- Background processing to maintain UI responsiveness
- Memory-efficient page-by-page processing

## Configuration

### Environment Variables
- `FLASK_ENV`: Set to 'development' for debug mode
- `MAX_CONTENT_LENGTH`: Maximum file upload size (default: 50MB)
- `UPLOAD_FOLDER`: Temporary file storage location

### Customization
- Modify `scales` array in `template_match_multiscale` for different scale ranges
- Adjust `threshold` parameter for match sensitivity
- Configure `overlap_threshold` for non-maximum suppression

## Testing

Run the test suite:
```bash
python test_app.py
```

### Test Coverage
- File validation
- Image preprocessing
- Template matching
- Progress tracking
- API endpoints
- Error handling

## Demo Mode

The application includes a demo mode that runs without heavy dependencies, showing:
- API structure and endpoints
- Mock processing with realistic timing
- Example response formats
- Progress tracking demonstration

## Supported Formats

### PDF Files
- `.pdf`

### Image Files
- `.jpg`, `.jpeg`
- `.png`
- `.bmp`
- `.tiff`, `.tif`

## Error Handling

The application provides comprehensive error handling for:
- Invalid file formats
- File size limits
- Empty or corrupted files
- Missing dependencies
- Processing errors
- Network timeouts

## Performance Considerations

- **Memory Usage**: Pages processed individually to manage memory
- **Processing Time**: Depends on PDF size, page count, and image complexity
- **Accuracy**: Multi-scale matching improves detection across size variations
- **Scalability**: Asynchronous processing allows multiple concurrent searches

## Future Enhancements

- Batch processing for multiple files
- Cloud storage integration
- Enhanced visualization of results
- Machine learning-based matching
- API rate limiting
- Result caching
- Export functionality

## License

This project is provided as a demonstration of PDF image search functionality with advanced computer vision techniques.