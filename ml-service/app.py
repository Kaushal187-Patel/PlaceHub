from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.career_recommender import CareerRecommender
from services.resume_analyzer import ResumeAnalyzer
from services.chatbot_ml import ChatbotML

load_dotenv()

app = Flask(__name__)

# Restrict CORS to the trusted backend origin instead of allowing every site.
_allowed_origins = os.getenv('ALLOWED_ORIGINS') or os.getenv('BACKEND_URL', 'http://localhost:5001')
CORS(app, origins=[o.strip() for o in _allowed_origins.split(',') if o.strip()])

# Cap request body size to mitigate memory-exhaustion via large uploads (default 10MB).
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))

# Initialize ML services
career_recommender = CareerRecommender()
resume_analyzer = ResumeAnalyzer()
chatbot_ml = ChatbotML()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ML Service'})

@app.route('/api/career/recommend', methods=['POST'])
def recommend_career():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({'error': 'Invalid or empty JSON body'}), 400
        result = career_recommender.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        job_role = request.form.get('job_role', 'Software Developer')
        
        analysis = resume_analyzer.analyze(file, job_role)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot/career-advice', methods=['POST'])
def chatbot_career_advice():
    try:
        data = request.get_json(silent=True) or {}
        user_input = data.get('message', '')
        
        recommendations = chatbot_ml.get_career_recommendations(user_input)
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot/skills-gap', methods=['POST'])
def chatbot_skills_gap():
    try:
        data = request.get_json(silent=True) or {}
        user_skills = data.get('skills', [])
        target_career = data.get('career', '')
        
        gap_analysis = chatbot_ml.analyze_skills_gap(user_skills, target_career)
        return jsonify(gap_analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    debug = os.getenv('FLASK_ENV', 'production').lower() == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)