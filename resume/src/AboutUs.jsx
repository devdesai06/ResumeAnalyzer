import React from 'react';
import './about.css';
import { useNavigate } from 'react-router-dom';
function AboutUs() {
  const navigate = useNavigate();
  return (
    <div className="about-page">
      <div className="about-container">
         <button className="back-button" onClick={() => navigate(-1)}>
          <span className="arrow-left">&#8592;</span>
          <span className="back-text">Back</span>
        </button>
        <h1>About the App</h1>
        <p>
          Welcome to <strong>Resumify</strong> – your smart resume analyzer built to help job seekers optimize their resumes using the power of AI.
        </p>
        <p>
          Our mission is to simplify the job search process by providing detailed insights into resume quality, highlighting strengths, identifying improvement areas, and offering personalized, industry-specific suggestions.
        </p>
        <p>
          We leverage Google's Gemini AI to offer intelligent feedback that helps you stand out in competitive hiring processes.
        </p>
        <p>
          Whether you're a student, a recent graduate, or an experienced professional, Resumify is here to help you level up your job application.
        </p>




      </div>
    </div>
  );
}

export default AboutUs;
