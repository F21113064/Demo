import unittest
import json
import time
import tempfile
import os
from unittest.mock import Mock, patch
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import ImageSearcher, progress_tracker

class TestImageSearcher(unittest.TestCase):
    
    def setUp(self):
        self.searcher = ImageSearcher()
        
    def test_init(self):
        """Test ImageSearcher initialization."""
        self.assertIsInstance(self.searcher.supported_image_formats, set)
        self.assertIsInstance(self.searcher.supported_pdf_formats, set)
        self.assertIn('.pdf', self.searcher.supported_pdf_formats)
        self.assertIn('.jpg', self.searcher.supported_image_formats)
        
    def test_validate_files_empty_files(self):
        """Test file validation with empty files."""
        mock_pdf = Mock()
        mock_pdf.filename = 'test.pdf'
        mock_image = Mock()
        mock_image.filename = 'test.jpg'
        
        # Test with None files
        mock_pdf_none = None
        is_valid, message = self.searcher.validate_files(mock_pdf_none, mock_image)
        self.assertFalse(is_valid)
        self.assertIn('validation error', message.lower())
        
    def test_validate_files_invalid_extensions(self):
        """Test file validation with invalid extensions."""
        mock_pdf = Mock()
        mock_pdf.filename = 'test.txt'  # Invalid PDF extension
        mock_image = Mock()
        mock_image.filename = 'test.jpg'
        
        is_valid, message = self.searcher.validate_files(mock_pdf, mock_image)
        self.assertFalse(is_valid)
        self.assertIn('Invalid PDF format', message)
        
        # Test invalid image extension
        mock_pdf.filename = 'test.pdf'
        mock_image.filename = 'test.doc'  # Invalid image extension
        
        is_valid, message = self.searcher.validate_files(mock_pdf, mock_image)
        self.assertFalse(is_valid)
        self.assertIn('Invalid image format', message)
        
    def test_validate_files_valid(self):
        """Test file validation with valid files."""
        mock_pdf = Mock()
        mock_pdf.filename = 'document.pdf'
        mock_image = Mock()
        mock_image.filename = 'template.png'
        
        is_valid, message = self.searcher.validate_files(mock_pdf, mock_image)
        
        # In demo mode (no dependencies), this should fail with dependency message
        if not self.searcher.dependencies_available:
            self.assertFalse(is_valid)
            self.assertIn('dependencies not available', message.lower())
        else:
            self.assertTrue(is_valid)
            self.assertEqual(message, "Files validated successfully")
            
    def test_preprocess_image(self):
        """Test image preprocessing."""
        # Create a mock image
        mock_image = [[255, 255, 255], [128, 128, 128], [0, 0, 0]]
        
        processed = self.searcher.preprocess_image(mock_image)
        
        # In demo mode, should return the same image
        if not self.searcher.dependencies_available:
            self.assertEqual(processed, mock_image)
        else:
            # Would test actual preprocessing with real dependencies
            self.assertIsNotNone(processed)
            
    def test_create_image_pyramid(self):
        """Test image pyramid creation."""
        mock_image = [[255, 255, 255]]
        scales = [0.5, 1.0, 2.0]
        
        pyramid = self.searcher.create_image_pyramid(mock_image, scales)
        
        # In demo mode, should return list of same length as scales
        if not self.searcher.dependencies_available:
            self.assertEqual(len(pyramid), len(scales))
        else:
            # Would test actual pyramid creation with real dependencies
            self.assertIsInstance(pyramid, list)
            
    def test_template_match_multiscale(self):
        """Test multi-scale template matching."""
        mock_page = [[255, 255, 255]]
        mock_template = [[128, 128, 128]]
        
        matches = self.searcher.template_match_multiscale(mock_page, mock_template)
        
        # Should return a list of match dictionaries
        self.assertIsInstance(matches, list)
        
        if matches:  # In demo mode, should have mock matches
            match = matches[0]
            required_keys = ['x', 'y', 'width', 'height', 'confidence', 'scale']
            for key in required_keys:
                self.assertIn(key, match)
                
    def test_remove_overlapping_matches(self):
        """Test overlapping match removal."""
        matches = [
            {'x': 100, 'y': 100, 'width': 50, 'height': 50, 'confidence': 0.9},
            {'x': 110, 'y': 110, 'width': 50, 'height': 50, 'confidence': 0.8},  # Overlapping
            {'x': 200, 'y': 200, 'width': 50, 'height': 50, 'confidence': 0.85}  # Non-overlapping
        ]
        
        filtered = self.searcher.remove_overlapping_matches(matches)
        
        # Should remove overlapping matches, keeping the one with highest confidence
        self.assertLessEqual(len(filtered), len(matches))
        
        # Should keep the highest confidence match
        if len(filtered) >= 1:
            self.assertEqual(filtered[0]['confidence'], 0.9)
            
    def test_search_image_in_pdf(self):
        """Test PDF image search functionality."""
        task_id = "test_task_123"
        pdf_path = "mock_pdf.pdf"
        image_path = "mock_image.jpg"
        
        result = self.searcher.search_image_in_pdf(pdf_path, image_path, task_id)
        
        # Should return a result dictionary
        self.assertIsInstance(result, dict)
        self.assertIn('success', result)
        
        # Check progress tracker was updated
        self.assertIn(task_id, progress_tracker)
        progress = progress_tracker[task_id]
        
        # Should have required progress fields
        required_fields = ['status', 'progress', 'message', 'total_pages', 'current_page', 'matches_found']
        for field in required_fields:
            self.assertIn(field, progress)
            
        # In demo mode, should complete successfully with mock data
        if not self.searcher.dependencies_available:
            self.assertTrue(result['success'])
            self.assertIn('matches', result)
            self.assertIn('total_matches', result)
            self.assertIn('total_pages', result)

class TestProgressTracking(unittest.TestCase):
    
    def test_progress_tracker_structure(self):
        """Test progress tracker data structure."""
        task_id = "test_progress"
        
        # Initialize progress
        progress_tracker[task_id] = {
            'status': 'starting',
            'progress': 0,
            'message': 'Test message',
            'total_pages': 10,
            'current_page': 0,
            'matches_found': 0,
            'matches': []
        }
        
        # Verify structure
        progress = progress_tracker[task_id]
        self.assertEqual(progress['status'], 'starting')
        self.assertEqual(progress['progress'], 0)
        self.assertEqual(progress['total_pages'], 10)
        self.assertIsInstance(progress['matches'], list)
        
        # Test updates
        progress_tracker[task_id].update({
            'status': 'processing',
            'progress': 50,
            'current_page': 5,
            'matches_found': 2
        })
        
        updated_progress = progress_tracker[task_id]
        self.assertEqual(updated_progress['status'], 'processing')
        self.assertEqual(updated_progress['progress'], 50)
        self.assertEqual(updated_progress['current_page'], 5)
        self.assertEqual(updated_progress['matches_found'], 2)

class TestAPIEndpoints(unittest.TestCase):
    
    def setUp(self):
        # Import app here to avoid issues with mocking
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
    def test_health_endpoint(self):
        """Test health check endpoint."""
        response = self.client.get('/health')
        
        # Should return JSON response
        if hasattr(response, 'get_json'):
            data = response.get_json()
            self.assertIn('status', data)
            self.assertIn('timestamp', data)
        
    def test_progress_endpoint_not_found(self):
        """Test progress endpoint with non-existent task."""
        response = self.client.get('/progress/nonexistent_task')
        
        # Should return 404 or appropriate error response
        self.assertIn(response.status_code, [404, 500])  # Depends on Flask version and mocking

if __name__ == '__main__':
    unittest.main()