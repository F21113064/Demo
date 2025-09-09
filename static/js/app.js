class PDFImageSearch {
    constructor() {
        this.currentTaskId = null;
        this.progressInterval = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('searchForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const pdfFile = formData.get('pdf_file');
        const imageFile = formData.get('image_file');

        // Validate files
        if (!pdfFile || !imageFile) {
            this.showError('Please select both PDF and image files');
            return;
        }

        // Validate file sizes
        if (pdfFile.size > 50 * 1024 * 1024) {
            this.showError('PDF file size must be less than 50MB');
            return;
        }

        if (imageFile.size > 10 * 1024 * 1024) {
            this.showError('Image file size must be less than 10MB');
            return;
        }

        this.startSearch(formData);
    }

    async startSearch(formData) {
        try {
            this.hideAllSections();
            this.setSearchButton(true);

            const response = await fetch('/search_image_pdf', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                this.showError(result.error);
                return;
            }

            this.currentTaskId = result.task_id;
            this.showProgressSection();
            this.startProgressTracking();

        } catch (error) {
            this.showError(`Network error: ${error.message}`);
        } finally {
            this.setSearchButton(false);
        }
    }

    startProgressTracking() {
        this.progressInterval = setInterval(() => {
            this.updateProgress();
        }, 1000);
    }

    async updateProgress() {
        if (!this.currentTaskId) return;

        try {
            const response = await fetch(`/progress/${this.currentTaskId}`);
            const result = await response.json();

            if (!result.success) {
                this.stopProgressTracking();
                this.showError('Failed to get progress update');
                return;
            }

            const progress = result.progress;
            this.updateProgressDisplay(progress);

            if (progress.status === 'completed') {
                this.stopProgressTracking();
                this.showResults(progress);
            } else if (progress.status === 'error') {
                this.stopProgressTracking();
                this.showError(progress.message);
            }

        } catch (error) {
            this.stopProgressTracking();
            this.showError(`Progress tracking error: ${error.message}`);
        }
    }

    updateProgressDisplay(progress) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressStats = document.getElementById('progressStats');

        progressBar.style.width = `${progress.progress}%`;
        progressBar.textContent = `${progress.progress}%`;
        progressText.textContent = progress.message;

        if (progress.total_pages > 0) {
            progressStats.innerHTML = `
                Page ${progress.current_page} of ${progress.total_pages} | 
                Matches found: ${progress.matches_found}
            `;
        }
    }

    showResults(progress) {
        this.hideProgressSection();
        
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');

        if (progress.matches && progress.matches.length > 0) {
            resultsContent.innerHTML = this.generateResultsHTML(progress.matches);
        } else {
            resultsContent.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    No matches found in the PDF. Try adjusting the image or using a different template.
                </div>
            `;
        }

        resultsSection.style.display = 'block';
    }

    generateResultsHTML(matches) {
        const totalMatches = matches.length;
        const pageGroups = this.groupMatchesByPage(matches);
        
        let html = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${totalMatches}</div>
                    <div class="stat-label">Total Matches</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Object.keys(pageGroups).length}</div>
                    <div class="stat-label">Pages with Matches</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.getAverageConfidence(matches)}%</div>
                    <div class="stat-label">Avg. Confidence</div>
                </div>
            </div>
            <hr>
            <h6>Matches by Page:</h6>
        `;

        Object.keys(pageGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(page => {
            const pageMatches = pageGroups[page];
            html += `
                <div class="mb-3">
                    <h6 class="mb-2">
                        <i class="bi bi-file-text"></i> Page ${page} 
                        <span class="badge bg-primary">${pageMatches.length} matches</span>
                    </h6>
                    ${pageMatches.map(match => this.generateMatchHTML(match)).join('')}
                </div>
            `;
        });

        return html;
    }

    generateMatchHTML(match) {
        const confidence = Math.round(match.confidence * 100);
        const confidenceClass = this.getConfidenceClass(confidence);
        
        return `
            <div class="match-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-bold">Match #${match.page}</div>
                        <small class="text-muted">
                            Position: (${match.x}, ${match.y}) | 
                            Size: ${match.width}×${match.height} | 
                            Scale: ${match.scale.toFixed(2)}x
                        </small>
                    </div>
                    <span class="confidence-badge ${confidenceClass}">
                        ${confidence}% confidence
                    </span>
                </div>
            </div>
        `;
    }

    groupMatchesByPage(matches) {
        return matches.reduce((groups, match) => {
            const page = match.page;
            if (!groups[page]) {
                groups[page] = [];
            }
            groups[page].push(match);
            return groups;
        }, {});
    }

    getAverageConfidence(matches) {
        if (matches.length === 0) return 0;
        const sum = matches.reduce((total, match) => total + match.confidence, 0);
        return Math.round((sum / matches.length) * 100);
    }

    getConfidenceClass(confidence) {
        if (confidence >= 80) return 'confidence-high';
        if (confidence >= 60) return 'confidence-medium';
        return 'confidence-low';
    }

    showProgressSection() {
        document.getElementById('progressSection').style.display = 'block';
    }

    hideProgressSection() {
        document.getElementById('progressSection').style.display = 'none';
    }

    showError(message) {
        this.hideAllSections();
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
    }

    hideAllSections() {
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }

    setSearchButton(disabled) {
        const button = document.getElementById('searchBtn');
        const icon = button.querySelector('i');
        
        if (disabled) {
            button.disabled = true;
            button.innerHTML = '<i class="bi bi-hourglass-split"></i> Searching...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-search"></i> Start Search';
        }
    }

    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PDFImageSearch();
});