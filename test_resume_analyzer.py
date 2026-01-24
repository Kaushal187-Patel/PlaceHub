#!/usr/bin/env python3
"""
Test script for the resume analyzer system
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml-service'))

from services.resume_analyzer import ResumeAnalyzer
import io

def create_mock_file(content, filename="test_resume.txt"):
    """Create a mock file object for testing"""
    class MockFile:
        def __init__(self, content, filename):
            self.content = content
            self.filename = filename
            
        def read(self):
            return self.content.encode('utf-8')
    
    return MockFile(content, filename)

def test_resume_analyzer():
    print("Testing Resume Analyzer System...")
    print("=" * 50)
    
    # Initialize the analyzer
    ra = ResumeAnalyzer()
    
    # Test cases with different resume content
    test_cases = [
        {
            'name': 'Software Developer Resume',
            'content': """
            John Doe
            Software Developer
            
            Experience:
            Software Engineer at Tech Corp (2020-2024)
            - Developed web applications using Python, JavaScript, React
            - Worked with SQL databases and AWS cloud services
            - Led a team of 3 developers
            
            Education:
            Bachelor of Computer Science, University (2016-2020)
            
            Skills: Python, JavaScript, React, Node.js, SQL, Git, HTML, CSS
            """,
            'job_role': 'Software Developer'
        },
        {
            'name': 'Data Scientist Resume',
            'content': """
            Jane Smith
            Data Scientist
            
            Experience:
            Data Analyst at Analytics Inc (2019-2024)
            - Performed statistical analysis using Python and R
            - Built machine learning models with TensorFlow
            - Created data visualizations with Tableau
            
            Education:
            Master of Data Science, Tech University (2017-2019)
            
            Skills: Python, R, Machine Learning, Statistics, Pandas, NumPy, TensorFlow
            """,
            'job_role': 'Data Scientist'
        },
        {
            'name': 'Entry Level Resume',
            'content': """
            Alex Johnson
            Recent Graduate
            
            Education:
            Bachelor of Engineering, State University (2020-2024)
            
            Projects:
            - Built a web application using HTML, CSS, JavaScript
            - Created a mobile app with basic Java
            
            Skills: Java, HTML, CSS, JavaScript, Basic Programming
            """,
            'job_role': 'Software Developer'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['name']}")
        print("-" * 30)
        
        try:
            # Create mock file
            mock_file = create_mock_file(test_case['content'])
            
            # Analyze resume
            result = ra.analyze(mock_file, test_case['job_role'])
            
            print(f"Match Percentage: {result['match_percentage']:.1f}%")
            print(f"Skill Match: {result['skill_match']:.1f}%")
            print(f"Experience: {result['experience_years']} years")
            print(f"Overall Rating: {result['overall_rating']}")
            print(f"Skills Found: {len(result['extracted_skills'])}")
            print(f"Recommendations: {len(result['recommendations'])}")
            
            # Show top skills
            if result['extracted_skills']:
                print(f"Top Skills: {', '.join(result['extracted_skills'][:5])}")
            
            # Show key recommendation
            if result['recommendations']:
                print(f"Key Insight: {result['recommendations'][0]}")
                
        except Exception as e:
            print(f"Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Resume Analyzer Test Complete!")

if __name__ == "__main__":
    test_resume_analyzer()