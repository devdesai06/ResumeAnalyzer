// gemini.js
const GEMINI_API_KEY = 'key'; //  API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const analyzeResume = async (resumeText) => {
    try {
        const prompt = `
    Please analyze the following resume  and provide a comprehensive evaluation. Focus on:
    
   You are a resume analysis expert. Given the resume, analyze it thoroughly and respond in the following structure with clear, professional feedback:

1. **Overall Structure & Formatting**  
   - Is the resume organized logically?
   

2. **Professional Summary/Objective**  
   - Does it effectively summarize the candidate’s background and goals?

3. **Work Experience Analysis**  
   - Are experiences relevant and clearly described?
   - Is impact (e.g. quantifiable achievements) evident?

4. **Skills Assessment**  
   - Are technical and soft skills clearly listed and aligned with the role?
   - Are they supported by examples?

5. **Education & Certifications**  
   - Are academic credentials strong and relevant?
   - Any notable honors or certifications missing?

6. **Areas for Improvement**  
   - What could be improved (content, structure, clarity)?

7. **Key Strengths**  
   - What stands out positively about this candidate?

8. **Missing Elements**  
   - Are any typical resume components missing (e.g., certifications, portfolio links, GitHub, etc.)?

9. **Industry-Specific Recommendations**  
   - Suggest improvements specific to the tech/software/web development industry.

10. **Overall Resume Score (1-100)**  
   - Give a total score based on completeness, clarity, relevance, and professionalism.



    
    (and add headings of the parts and numbers like 1,2,3 )
    please dont use bold or ** 
    be brutaly honest and give a detailed review
    Please provide specific, actionable feedback and suggestions for improvement.
    
    Resume Content:
    ${resumeText}
    `;
//data which needs to be sent to API
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,//Out of all possible next words, only consider the top 40 best ones before picking.
                topP: 0.95,//Look at the smallest group of words that together have a 95% chance of being the correct next word.
                maxOutputTokens: 3048,//similar to number of words
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Response:', response.status, errorData);

            if (response.status === 400) {
                throw new Error(`Invalid API request. Please check your API key and request format.`);
            } else if (response.status === 403) {
                throw new Error(`API key invalid or quota exceeded. Please check your Gemini API key.`);
            } else if (response.status === 404) {
                throw new Error(`Model not found. The gemini-1.5-flash model may not be available in your region.`);
            } else {
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected API response format');
        }
    } catch (error) {
        console.error('Error analyzing resume:', error);
        return `Error analyzing resume: ${error.message}. Please check your API key and try again.`;
    }
};

