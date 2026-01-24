import re
from collections import Counter
from .career_recommender import CareerRecommender
from .resume_analyzer import ResumeAnalyzer

class ChatbotML:
    def __init__(self):
        self.career_recommender = CareerRecommender()
        self.resume_analyzer = ResumeAnalyzer()
        
    def get_career_recommendations(self, user_input):
        """Get career recommendations based on user input"""
        try:
            # Parse user input for career recommendation
            parsed_input = self._parse_user_input(user_input)
            result = self.career_recommender.predict(parsed_input)
            return result
        except Exception as e:
            print(f"Error getting career recommendations: {e}")
            return None
    
    def analyze_skills_gap(self, user_skills, target_career):
        """Analyze skill gaps for a target career"""
        try:
            # Get career requirements
            career_db = self.career_recommender.career_database
            if target_career not in career_db:
                return None
                
            career_info = career_db[target_career]
            required_skills = career_info['required_skills']
            preferred_skills = career_info['preferred_skills']
            
            # Calculate matches and gaps
            user_skills_lower = [skill.lower() for skill in user_skills]
            
            matched_required = []
            missing_required = []
            for skill in required_skills:
                if any(skill.lower() in user_skill or user_skill in skill.lower() 
                       for user_skill in user_skills_lower):
                    matched_required.append(skill)
                else:
                    missing_required.append(skill)
            
            matched_preferred = []
            missing_preferred = []
            for skill in preferred_skills:
                if any(skill.lower() in user_skill or user_skill in skill.lower() 
                       for user_skill in user_skills_lower):
                    matched_preferred.append(skill)
                else:
                    missing_preferred.append(skill)
            
            return {
                'matched_required': matched_required,
                'missing_required': missing_required,
                'matched_preferred': matched_preferred,
                'missing_preferred': missing_preferred,
                'skill_match_percentage': len(matched_required) / len(required_skills) * 100
            }
        except Exception as e:
            print(f"Error analyzing skills gap: {e}")
            return None
    
    def get_learning_recommendations(self, missing_skills):
        """Get learning recommendations for missing skills"""
        learning_resources = {
            'python': {
                'courses': ['Python for Everybody (Coursera)', 'Complete Python Bootcamp (Udemy)'],
                'practice': ['LeetCode', 'HackerRank', 'Codewars'],
                'projects': ['Build a web scraper', 'Create a data analysis project']
            },
            'javascript': {
                'courses': ['JavaScript: The Complete Guide (Udemy)', 'freeCodeCamp JavaScript'],
                'practice': ['Codepen', 'JSFiddle', 'JavaScript30'],
                'projects': ['Build a todo app', 'Create an interactive website']
            },
            'react': {
                'courses': ['React - The Complete Guide (Udemy)', 'React Official Tutorial'],
                'practice': ['Build React projects', 'Contribute to open source'],
                'projects': ['Personal portfolio', 'E-commerce site', 'Social media app']
            },
            'sql': {
                'courses': ['SQL for Data Science (Coursera)', 'Complete SQL Bootcamp'],
                'practice': ['SQLBolt', 'W3Schools SQL', 'HackerRank SQL'],
                'projects': ['Database design project', 'Data analysis with SQL']
            },
            'machine learning': {
                'courses': ['Machine Learning Course (Coursera)', 'Fast.ai Practical Deep Learning'],
                'practice': ['Kaggle competitions', 'Google Colab notebooks'],
                'projects': ['Prediction model', 'Image classification', 'NLP project']
            }
        }
        
        recommendations = {}
        for skill in missing_skills[:5]:  # Top 5 missing skills
            skill_lower = skill.lower()
            if skill_lower in learning_resources:
                recommendations[skill] = learning_resources[skill_lower]
            else:
                # Generic recommendations
                recommendations[skill] = {
                    'courses': [f'Search for "{skill}" courses on Coursera, Udemy, or edX'],
                    'practice': [f'Practice {skill} through hands-on projects'],
                    'projects': [f'Build a project using {skill}']
                }
        
        return recommendations
    
    def get_job_market_insights(self, role, location='Remote'):
        """Get job market insights for a specific role"""
        # Mock job market data - in production, this would come from real job APIs
        market_data = {
            'Software Engineer': {
                'demand': 'Very High',
                'avg_salary': '$95,000',
                'growth_rate': '22%',
                'top_skills': ['JavaScript', 'Python', 'React', 'Node.js'],
                'companies_hiring': ['Google', 'Microsoft', 'Amazon', 'Meta']
            },
            'Data Scientist': {
                'demand': 'High',
                'avg_salary': '$120,000',
                'growth_rate': '35%',
                'top_skills': ['Python', 'SQL', 'Machine Learning', 'Tableau'],
                'companies_hiring': ['Netflix', 'Uber', 'Airbnb', 'Tesla']
            },
            'Product Manager': {
                'demand': 'High',
                'avg_salary': '$130,000',
                'growth_rate': '19%',
                'top_skills': ['Analytics', 'User Research', 'Agile', 'Strategy'],
                'companies_hiring': ['Apple', 'Google', 'Facebook', 'LinkedIn']
            }
        }
        
        return market_data.get(role, {
            'demand': 'Moderate',
            'avg_salary': '$75,000',
            'growth_rate': '10%',
            'top_skills': ['Communication', 'Problem Solving'],
            'companies_hiring': ['Various companies']
        })
    
    def _parse_user_input(self, user_input):
        """Parse user input to extract relevant information for ML models"""
        # Extract skills mentioned in the input
        skills = self._extract_skills_from_text(user_input)
        
        # Extract experience level
        experience = self._extract_experience_from_text(user_input)
        
        # Extract interests
        interests = self._extract_interests_from_text(user_input)
        
        return {
            'skills': ', '.join(skills) if skills else '',
            'interests': ', '.join(interests) if interests else '',
            'experience': experience,
            'education': '',  # Could be extracted if mentioned
            'goals': user_input  # Use full input as goals context
        }
    
    def _extract_skills_from_text(self, text):
        """Extract skills mentioned in text"""
        # Common skills to look for
        skill_patterns = [
            'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'html', 'css',
            'machine learning', 'data analysis', 'project management', 'leadership',
            'communication', 'problem solving', 'teamwork', 'git', 'docker', 'aws'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skill_patterns:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_experience_from_text(self, text):
        """Extract experience level from text"""
        # Look for experience patterns
        experience_patterns = [
            r'(\d+)\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\s*years?\s*in',
            r'(\d+)\+?\s*years?'
        ]
        
        for pattern in experience_patterns:
            match = re.search(pattern, text.lower())
            if match:
                return f"{match.group(1)} years"
        
        # Look for experience level keywords
        if any(word in text.lower() for word in ['beginner', 'entry', 'junior', 'new']):
            return '0 years'
        elif any(word in text.lower() for word in ['senior', 'lead', 'principal']):
            return '5+ years'
        elif any(word in text.lower() for word in ['mid', 'intermediate']):
            return '2-4 years'
        
        return '1 year'
    
    def _extract_interests_from_text(self, text):
        """Extract interests from text"""
        interest_keywords = [
            'web development', 'data science', 'machine learning', 'mobile development',
            'game development', 'cybersecurity', 'cloud computing', 'ai', 'blockchain',
            'design', 'user experience', 'product management', 'marketing', 'sales'
        ]
        
        text_lower = text.lower()
        found_interests = []
        
        for interest in interest_keywords:
            if interest in text_lower:
                found_interests.append(interest)
        
        return found_interests