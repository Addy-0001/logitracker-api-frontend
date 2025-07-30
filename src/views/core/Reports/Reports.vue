<template>
    <div class="job-pdf-manager">
        <!-- Header Section -->
        <div class="header-section">
            <div class="header-content">
                <h1 class="page-title">
                    <i class="fas fa-file-pdf"></i>
                    Job PDF Documents
                </h1>
                <p class="page-subtitle">Manage and download job-related PDF documents</p>

                <div class="header-actions">
                    <button @click="fetchPdfFiles" :disabled="loading" class="refresh-btn">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        {{ loading ? 'Loading...' : 'Refresh' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section" v-if="pdfData">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="stat-content">
                    <h3>{{ pdfData.count }}</h3>
                    <p>Total PDF Files</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-download"></i>
                </div>
                <div class="stat-content">
                    <h3>{{ downloadCount }}</h3>
                    <p>Downloads Today</p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !pdfData" class="loading-container">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading PDF documents...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Error Loading PDFs</h3>
            <p>{{ error }}</p>
            <button @click="fetchPdfFiles" class="retry-btn">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>

        <!-- PDF Files Grid -->
        <div v-if="pdfData && pdfData.files.length > 0" class="pdf-grid">
            <div v-for="file in pdfData.files" :key="file.id" class="pdf-card">
                <div class="pdf-card-header">
                    <div class="pdf-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="pdf-info">
                        <h3 class="pdf-name">{{ file.name }}</h3>
                        <p class="pdf-id">ID: {{ file.id }}</p>
                    </div>
                </div>

                <div class="pdf-card-body">
                    <div class="pdf-preview">
                        <i class="fas fa-file-pdf pdf-preview-icon"></i>
                        <p>PDF Document</p>
                    </div>
                </div>

                <div class="pdf-card-actions">
                    <button @click="viewPdf(file)" class="action-btn view-btn">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button @click="downloadPdf(file)" class="action-btn download-btn">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="pdfData && pdfData.files.length === 0" class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <h3>No PDF Documents Found</h3>
            <p>There are currently no PDF documents available for jobs.</p>
            <button @click="fetchPdfFiles" class="refresh-btn">
                <i class="fas fa-sync-alt"></i>
                Refresh
            </button>
        </div>

        <!-- PDF Viewer Modal -->
        <div v-if="showPdfViewer" class="pdf-modal-overlay" @click="closePdfViewer">
            <div class="pdf-modal" @click.stop>
                <div class="pdf-modal-header">
                    <h3>{{ selectedFile?.name }}</h3>
                    <button @click="closePdfViewer" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="pdf-modal-body">
                    <iframe v-if="selectedFile" :src="selectedFile.url" class="pdf-iframe" frameborder="0"></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import apiClient from '@/api/axios'
import axios from 'axios'

export default {
    name: 'JobPdfManager',
    data() {
        return {
            pdfData: null,
            loading: false,
            error: null,
            downloadCount: 0,
            showPdfViewer: false,
            selectedFile: null
        }
    },
    mounted() {
        this.fetchPdfFiles()
        this.loadDownloadCount()
    },
    methods: {
        async fetchPdfFiles() {
            this.loading = true
            this.error = null

            try {
                const response = await apiClient.get('/job/getAllJobsPdf')
                this.pdfData = response.data

                // Validate the response structure
                if (!this.pdfData.files || !Array.isArray(this.pdfData.files)) {
                    throw new Error('Invalid response format')
                }

            } catch (error) {
                console.error('Error fetching PDF files:', error)
                this.error = error.response?.data?.message || 'Failed to load PDF documents'
            } finally {
                this.loading = false
            }
        },

        viewPdf(file) {
            this.selectedFile = file
            this.showPdfViewer = true
        },

        closePdfViewer() {
            this.showPdfViewer = false
            this.selectedFile = null
        },

        async downloadPdf(file) {
            try {
                // Create a temporary link to download the file
                const link = document.createElement('a')
                link.href = file.url
                link.download = file.name
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                // Increment download count
                this.downloadCount++
                this.saveDownloadCount()

                // Show success message
                this.showNotification('PDF downloaded successfully!', 'success')

            } catch (error) {
                console.error('Error downloading PDF:', error)
                this.showNotification('Failed to download PDF', 'error')
            }
        },

        loadDownloadCount() {
            const today = new Date().toDateString()
            const savedData = localStorage.getItem('pdfDownloadCount')

            if (savedData) {
                const data = JSON.parse(savedData)
                if (data.date === today) {
                    this.downloadCount = data.count
                }
            }
        },

        saveDownloadCount() {
            const today = new Date().toDateString()
            const data = {
                date: today,
                count: this.downloadCount
            }
            localStorage.setItem('pdfDownloadCount', JSON.stringify(data))
        },

        showNotification(message, type) {
            // Simple notification - you can replace with a proper notification system
            const notification = document.createElement('div')
            notification.className = `notification ${type}`
            notification.textContent = message
            notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
      `

            document.body.appendChild(notification)

            setTimeout(() => {
                notification.remove()
            }, 3000)
        }
    }
}
</script>

<style>
@import './reports.css';

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
