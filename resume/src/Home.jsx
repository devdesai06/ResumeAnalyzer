import './App.css';
import { useState } from 'react';
import { analyzeResume } from './gemini.js';
import { useNavigate } from 'react-router-dom';
import './pdfWorker';
import * as pdfjsLib from 'pdfjs-dist';


function Home() {
  const [fileName, setFileName] = useState('');//naming the file input
  const [dragActive, setDragActive] = useState(false);//if the user holds the file over , dragActive is true
  const [resumeText, setResumeText] = useState('');//reading the text for Resume (handleFileTRead)
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const navigate = useNavigate();

  //function for about us page
  const handleAboutClick = () => {
    navigate('/about');
  };
  //This function takes a file and reads its contents,
  const handleFileRead = (file) => {
    const reader = new FileReader();//built-in js object
    reader.onload = (e) => {
      const text = e.target.result;
      setResumeText(text);
      setError(''); // Clear any previous errors
    };
    reader.onerror = (e) => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  };
  //This function handles what happens when a user selects a file 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();//for knowing whether its pdf,txt
    setFileName(file.name);

    try {
      if (extension === 'txt') {
        handleFileRead(file);
      } else if (extension === 'pdf') {
        const text = await readPdfAsText(file);
        setResumeText(text);
        setError('');
      } else {
        setError('Please upload a .txt or .pdf file.');
      }
    }
    catch (err) {
      setError('Could not read the file. Please try again.');
    }
  };

//when the user drag and drops the file
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (file.type === 'text/plain' || fileExtension === '.txt') {
      setFileName(file.name);
      handleFileRead(file); // your existing text reader
    } else if (file.type === 'application/pdf' || fileExtension === '.pdf') {
      setFileName(file.name);
      try {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;

          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            text += pageText + '\n';
          }

          setResumeText(text);
          setError('');
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('Error reading PDF:', err);
        setError('Failed to read PDF. Please try another file.');
      }
    } else {
      setError('Please upload a valid .txt or .pdf file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleAnalyze = async () => {
    if (!resumeText) {
      setError('Please upload a resume first.');
      return;
    }



    setLoading(true);
    setError('');
    setAnalysis('');

    try {
      let result;

      result = await analyzeResume(resumeText);

      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze resume. Please check your API key and internet connection.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };
  //clear all botton
  const handleClearAll = () => {
    setFileName('');
    setResumeText('');
    setAnalysis('');
    setError('');
    setConnectionStatus('');
  };


  //copy the analysis to clipboard
  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis).then(() => {
        alert('Analysis copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy to clipboard');
      });
    }
  };

  const readPdfAsText = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            text += strings.join(' ') + '\n';
          }

          resolve(text);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="navbar">
          <nav>
            <ul>
              <li><strong>Resumify </strong></li>
              <li className="about-app">
                <button onClick={handleAboutClick} className="nav-button">
                  Resume Analyzer
                </button>
              </li>

            </ul>
          </nav>
        </div>

        {error && (
          <div className="error-message" style={{
            color: '#ff6b6b',
            backgroundColor: '#ffe0e0',
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0',
            border: '1px solid #ff6b6b'
          }}>
            {error}
          </div>
        )}

        <div
          className={`upload-here ${dragActive ? 'drag-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: dragActive ? '2px dashed #007bff' : '2px dashed #ccc',
            borderRadius: '10px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'center',
            backgroundColor: dragActive ? '#f0f8ff' : '#f9f9f9',
            transition: 'all 0.3s ease'
          }}
        >
          <input
            type="file"
            id="resumefile"
            className="file-input"
            onChange={handleFileChange}
            accept=".txt,.pdf"
            hidden
          />
          <label htmlFor="resumefile" className='custom-upload' style={{ cursor: 'pointer' }}>
            {fileName ? `✓ Uploaded: ${fileName}` : '📄 Upload your resume or drag it here'}
          </label>
        </div>



        <div className="analyze" style={{ margin: '20px 0' }}>
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px',
              transition: 'background-color 0.3s ease'
            }}
          >
            {loading ? '🔄 Analyzing...' : '🚀 Analyze Resume'}
          </button>

          <button
            onClick={handleClearAll}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
              marginTop: '5px',
              transition: 'background-color 0.3s ease'
            }}
          >
            🗑️ Clear All
          </button>


        </div>

        {connectionStatus && (
          <div style={{
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            backgroundColor: connectionStatus.includes('✅') ? '#d4edda' : '#f8d7da',
            color: connectionStatus.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${connectionStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {connectionStatus}
          </div>
        )}

        {loading && (
          <div style={{ margin: '20px 0' }}>
            <p> Analyzing your resume... This may take a moment.</p>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#007bff',
                animation: 'loading 2s infinite linear',
                transform: 'translateX(-100%)'
              }}></div>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="analysis-output" style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '10px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'left',
            maxWidth: '800px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, color: '#007bff' }}>📊 Analysis Result:</h3>
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📋 Copy
              </button>
            </div>
            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#333',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '5px',
              border: '1px solid #e9ecef'
            }}>
              {analysis}
            </div>
          </div>
        )}


      </header>
    </div>
  );
}

export default Home;