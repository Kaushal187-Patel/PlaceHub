// Shared resume service to sync data between dashboard and resume analyzer
class SharedResumeService {
  constructor() {
    this.listeners = [];
    this.currentAnalysis = null;
  }

  // Subscribe to resume analysis updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all subscribers of analysis update
  notifyAnalysisUpdate(analysis) {
    this.currentAnalysis = analysis;
    this.listeners.forEach(callback => callback(analysis));
    
    // Also dispatch custom event for components that use event listeners
    window.dispatchEvent(new CustomEvent('resumeAnalysisUpdate', {
      detail: analysis
    }));
  }

  // Get current analysis
  getCurrentAnalysis() {
    return this.currentAnalysis;
  }

  // Update analysis from resume analyzer
  updateFromAnalyzer(analysis) {
    this.notifyAnalysisUpdate(analysis);
  }

  // Update analysis from dashboard
  updateFromDashboard(analysis) {
    this.notifyAnalysisUpdate(analysis);
  }

  // Format analysis data for dashboard
  formatForDashboard(analysis) {
    if (!analysis) return null;

    const score = analysis.similarity_score 
      ? Math.round(analysis.similarity_score * 100) 
      : analysis.match_percentage || 0;

    return {
      score,
      strengths: analysis.suggestions?.dos || analysis.strengths || [],
      weaknesses: analysis.suggestions?.improvements || analysis.suggestions?.donts || [],
      suggestions: analysis.recommendations || [],
      keywordSuggestions: analysis.missing_required_skills || [],
      extractedSkills: analysis.extracted_skills || [],
      lastUpdated: new Date().toISOString(),
      filename: 'Latest Resume',
      fullAnalysis: analysis
    };
  }

  // Clear analysis data
  clearAnalysis() {
    this.currentAnalysis = null;
    this.notifyAnalysisUpdate(null);
  }
}

// Create singleton instance
const sharedResumeService = new SharedResumeService();

export default sharedResumeService;