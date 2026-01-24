#!/usr/bin/env python3
"""
Training script for Aspiro ML models
"""

import os
import sys
from services.career_recommender import CareerRecommender
from services.resume_analyzer import ResumeAnalyzer

def train_career_model():
    """Train the career recommendation model"""
    print("Training Career Recommendation Model...")
    try:
        recommender = CareerRecommender()
        print("[SUCCESS] Career recommendation model trained successfully!")
        return True
    except Exception as e:
        print(f"[ERROR] Error training career model: {e}")
        return False

def train_resume_model():
    """Train the resume analyzer model"""
    print("Training Resume Analyzer Model...")
    try:
        analyzer = ResumeAnalyzer()
        print("[SUCCESS] Resume analyzer model trained successfully!")
        return True
    except Exception as e:
        print(f"[ERROR] Error training resume model: {e}")
        return False

def main():
    """Main training function"""
    print("=== Aspiro ML Model Training ===")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    success_count = 0
    total_models = 2
    
    # Train models
    if train_career_model():
        success_count += 1
    
    if train_resume_model():
        success_count += 1
    
    # Summary
    print(f"\n=== Training Complete ===")
    print(f"Successfully trained: {success_count}/{total_models} models")
    
    if success_count == total_models:
        print("[SUCCESS] All models trained successfully!")
        return 0
    else:
        print("[WARNING] Some models failed to train. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())