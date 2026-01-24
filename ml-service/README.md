# Aspiro ML Service

AI-powered machine learning service providing career recommendations and resume analysis.

## 🚀 Features

### Career Recommendation System
- **Random Forest Classifier** with hyperparameter tuning
- **K-Nearest Neighbors** for profile similarity matching
- Real-time career path suggestions based on:
  - Educational background
  - Skills assessment
  - Work experience
  - Career interests
  - Personal goals

### Resume Analyzer
- **PDF/DOCX parsing** with text extraction
- **NLP entity extraction** using spaCy
- **TF-IDF vectorization** for job matching
- **Cosine similarity** scoring
- **Logistic regression** for match classification

## 📋 Prerequisites

- Python 3.8+
- pip package manager

## 🛠️ Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model (optional but recommended)
python -m spacy download en_core_web_sm

# Train initial models
python train_models.py
```

## 🚀 Usage

### Start the Service
```bash
python app.py
```

The service will be available at `http://localhost:5001`

### API Endpoints

#### Career Recommendations
```http
POST /api/career/recommend
Content-Type: application/json

{
  "education_level": "Bachelor",
  "field_of_study": "Computer Science",
  "programming_skills": 8,
  "communication_skills": 7,
  "leadership_skills": 6,
  "years_experience": 2,
  "interests_tech": 9,
  "interests_business": 4
}
```

#### Resume Analysis
```http
POST /api/resume/analyze
Content-Type: multipart/form-data

resume: [PDF/DOCX file]
job_description: "Software Engineer position requiring Python, React..."
```

## 📊 Model Details

### Career Recommender
- **Algorithm**: Random Forest + KNN ensemble
- **Features**: 8 input features (education, skills, experience, interests)
- **Output**: Top 3 career recommendations with confidence scores
- **Optimization**: GridSearchCV for hyperparameter tuning

### Resume Analyzer
- **Text Processing**: PyPDF2, python-docx for file parsing
- **NLP**: spaCy for entity extraction
- **Similarity**: TF-IDF + Cosine similarity
- **Classification**: Logistic Regression for match prediction

## 📁 Project Structure

```
ml-service/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── train_models.py       # Model training script
├── services/
│   ├── career_recommender.py
│   └── resume_analyzer.py
├── models/               # Trained model files
├── data/                # Training datasets
└── uploads/             # Temporary file storage
```

## 🔧 Configuration

Environment variables in `.env`:
```env
FLASK_ENV=development
PORT=5001
BACKEND_URL=http://localhost:5000
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:5001/api/health

# Test career recommendation
curl -X POST http://localhost:5001/api/career/recommend \
  -H "Content-Type: application/json" \
  -d '{"education_level":"Bachelor","field_of_study":"Computer Science"}'
```

## 📈 Performance

- **Career Recommendations**: ~100ms response time
- **Resume Analysis**: ~2-5s depending on file size
- **Concurrent Requests**: Supports multiple simultaneous requests
- **Memory Usage**: ~200MB baseline, scales with request volume

## 🔄 Model Updates

Models are automatically trained on first run. To retrain:

```bash
python train_models.py
```

## 🚨 Error Handling

- File format validation (PDF/DOCX only)
- Size limits (5MB max)
- Graceful fallbacks for missing spaCy models
- Comprehensive error logging

## 📝 API Response Examples

### Career Recommendation Response
```json
{
  "recommendations": [
    {
      "career": "Software Engineer",
      "confidence": 0.85,
      "match_percentage": 85.0
    },
    {
      "career": "Data Scientist",
      "confidence": 0.72,
      "match_percentage": 72.0
    }
  ]
}
```

### Resume Analysis Response
```json
{
  "similarity_score": 0.78,
  "match_percentage": 82.5,
  "extracted_skills": ["python", "react", "sql"],
  "organizations": ["Google", "Microsoft"],
  "education": ["Bachelor in Computer Science"],
  "experience_years": 3,
  "recommendations": [
    "Excellent match! Your profile aligns well with the requirements"
  ],
  "overall_rating": "Excellent"
}
```