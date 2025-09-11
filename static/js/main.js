class PDFViewer {
    constructor() {
        this.currentFilename = '';
        this.pdfFrame = document.getElementById('pdfFrame');
        this.pdfInfo = document.getElementById('pdfInfo');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Upload functionality
        document.getElementById('uploadBtn').addEventListener('click', () => this.uploadFile());
        document.getElementById('pdfFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.uploadFile();
            }
        });

        // PDF refresh
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshPDF());

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchPDF());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchPDF();
            }
        });
    }

    async uploadFile() {
        const fileInput = document.getElementById('pdfFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showUploadStatus('Please select a PDF file', 'error');
            return;
        }

        if (!file.type.includes('pdf')) {
            this.showUploadStatus('Please select a valid PDF file', 'error');
            return;
        }

        this.showUploadStatus('Uploading...', 'loading');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentFilename = result.filename;
                this.showUploadStatus(`Uploaded: ${result.filename} (${result.pages} pages)`, 'success');
                this.loadPDF(result.filename, result.pages);
            } else {
                this.showUploadStatus(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showUploadStatus(`Upload failed: ${error.message}`, 'error');
        }
    }

    loadPDF(filename, pages) {
        this.pdfFrame.src = `/pdf/${filename}`;
        this.pdfFrame.style.display = 'block';
        document.getElementById('noPdfMessage').style.display = 'none';
        this.pdfInfo.textContent = `${filename} (${pages} pages)`;
    }

    refreshPDF() {
        if (this.currentFilename) {
            this.pdfFrame.src = this.pdfFrame.src;
        }
    }

    showUploadStatus(message, type) {
        const status = document.getElementById('uploadStatus');
        status.textContent = message;
        status.className = type;
    }

    async searchPDF() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) {
            this.showSearchStatus('Please enter a search term');
            return;
        }

        if (!this.currentFilename) {
            this.showSearchStatus('Please upload a PDF file first');
            return;
        }

        this.showSearchStatus('Searching...');
        
        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });

            const result = await response.json();
            this.displaySearchResults(result.results, query);
        } catch (error) {
            this.showSearchStatus(`Search failed: ${error.message}`);
        }
    }

    displaySearchResults(results, query) {
        const container = document.getElementById('resultsContainer');
        
        if (results.length === 0) {
            this.showSearchStatus('No results found');
            container.innerHTML = '';
            return;
        }

        this.showSearchStatus(`Found ${results.length} result${results.length !== 1 ? 's' : ''}`);
        
        container.innerHTML = results.map(result => {
            const highlightedContext = this.highlightText(result.context, query);
            return `
                <div class="result-item">
                    <div class="result-page">Page ${result.page}</div>
                    <div class="result-context">${highlightedContext}</div>
                </div>
            `;
        }).join('');
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('resultsContainer').innerHTML = '';
        this.showSearchStatus('');
    }

    showSearchStatus(message) {
        document.getElementById('searchStatus').textContent = message;
    }
}

// Initialize the PDF viewer when the page loads
let pdfViewer;
document.addEventListener('DOMContentLoaded', () => {
    pdfViewer = new PDFViewer();
});