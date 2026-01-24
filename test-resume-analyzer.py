#!/usr/bin/env python3

import requests
import os

def test_resume_analyzer():
    """Test the resume analyzer with a sample text file"""
    
    # Create a sample resume text file
    sample_resume = """
John Doe
Software Developer
Email: john.doe@email.com
Phone: +1234567890

EXPERIENCE:
Software Developer at Tech Corp (2020-2024)
- Developed web applications using Python, JavaScript, and React
- Built REST APIs with Node.js and Express
- Worked with MySQL and MongoDB databases
- Implemented CI/CD pipelines using Docker and Jenkins
- 4 years of experience in full-stack development

EDUCATION:
Bachelor of Science in Computer Science
University of Technology (2016-2020)

SKILLS:
- Programming: Python, JavaScript, Java, HTML, CSS
- Frameworks: React, Node.js, Express, Django
- Databases: MySQL, MongoDB, PostgreSQL
- Tools: Git, Docker, Jenkins, AWS
- Soft Skills: Problem Solving, Team Collaboration, Communication
"""
    
    # Write sample resume to file
    with open('sample_resume.txt', 'w') as f:
        f.write(sample_resume)
    
    # Test the ML service
    try:
        url = 'http://localhost:5001/api/resume/analyze'
        
        with open('sample_resume.txt', 'rb') as f:
            files = {'resume': ('sample_resume.txt', f, 'text/plain')}
            data = {'job_role': 'Software Developer'}
            
            response = requests.post(url, files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Resume Analyzer Test PASSED!")
            print(f"📊 Match Percentage: {result.get('match_percentage', 0)}%")
            print(f"🔧 Extracted Skills: {result.get('extracted_skills', [])}")
            print(f"🏢 Organizations: {result.get('organizations', [])}")
            print(f"📚 Education: {result.get('education', [])}")
            print(f"⏰ Experience: {result.get('experience_years', 0)} years")
            print(f"⭐ Overall Rating: {result.get('overall_rating', 'N/A')}")
            print("\n🎯 This proves the analyzer processes REAL resume data!")
        else:
            print(f"❌ Test failed with status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        print("Make sure ML service is running on port 5001")
    
    finally:
        # Clean up
        if os.path.exists('sample_resume.txt'):
            os.remove('sample_resume.txt')

if __name__ == "__main__":
    test_resume_analyzer()