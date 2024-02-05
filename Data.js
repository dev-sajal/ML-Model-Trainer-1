import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import Papa from 'papaparse';
import './Data.css';

function Data() {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [columnNames, setColumnNames] = useState([]);
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const [testButton, setTestButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileDrop = async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];

    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setLoading(true);
      setError(null);

      Papa.parse(selectedFile, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const firstRow = result.data[0];
          if (firstRow) {
            const columns = Object.keys(firstRow);
            setColumnNames(columns);
            setData(result.data);
          } else {
            setError('CSV file is empty.');
          }
          setLoading(false);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
          setLoading(false);
        },
      });
    } else {
      setError('Please drop a CSV file.');
    }
  };

  const handleTrainModel = async () => {
    if (!file || !target || !algorithm) {
      alert('Please select a CSV file, target variable, and algorithm.');
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('algo_name', algorithm);
    formData.append('file', file);
    formData.append('target_var', target);

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Response:", response.data);
      const responseData = response.data;

      // Assuming the structure based on the JSON example above
      if (responseData && responseData.train && responseData.test) {
        const { accuracy: trainAccuracy, precision: trainPrecision, f1_score: trainF1Score, confusion_matriex: trainConfusionMatrix } = responseData.train;
        const { accuracy: testAccuracy, precision: testPrecision, f1_score: testF1Score, confusion_matriex: testConfusionMatrix } = responseData.test;

        console.log("Train Report:", { accuracy: trainAccuracy, precision: trainPrecision, f1_score: trainF1Score, confusion_matriex: trainConfusionMatrix });
        console.log("Test Report:", { accuracy: testAccuracy, precision: testPrecision, f1_score: testF1Score, confusion_matriex: testConfusionMatrix });

        // setColumnNames(columns);
        setData(data);
        setResult({
          train: { accuracy: trainAccuracy, precision: trainPrecision, f1_score: trainF1Score, confusion_matrix: trainConfusionMatrix },
          test: { accuracy: testAccuracy, precision: testPrecision, f1_score: testF1Score, confusion_matrix: testConfusionMatrix },
        });
        setTestButton(true)
        console.log("Success");
        console.log("Result:", result);
      } else {
        setError("Invalid response format");
      }

      console.log("Success")

    } catch (error) {
      setError(`Error training model: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="split left-section">
        <Dropzone onDrop={handleFileDrop} accept=".csv">
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} style={{ border: '1px dashed  #383f51', padding: '20px', textAlign: 'center' }}>
              <input {...getInputProps()} />
              {file ? `Selected CSV File: ${file.name}` : loading ? 'Loading...' : "Drag 'n' drop a CSV file here, or click to select one"}
            </div>
          )}
        </Dropzone>
        <br />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {data.length > 0 && (
          <div className='Table'>
            <p>Data:</p>

            <table>
              <thead>
                <tr>
                  {columnNames.map((columnName, index) => (
                    <th key={index}>{columnName}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columnNames.map((columnName, columnIndex) => (
                      <td key={columnIndex}>{row[columnName]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {columnNames.length > 0 && (
          <label>
            Target Variable:
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Select Target Variable</option>
              {columnNames.map((columnName, index) => (
                <option key={index} value={columnName}>
                  {columnName}
                </option>
              ))}
            </select>
          </label>
        )}
        <br />
        <label>
          Algorithm:
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
            <option value="">Select Algorithm</option>
            <option value="Logistic Regression">Logistic Regression</option>
            <option value="Linear Regression">Linear Regression</option>
            <option value="Decision Tree">Decision Tree</option>
          </select>
        </label>
        <br />
        <button onClick={handleTrainModel} disabled={loading}>Train Model</button>
        <button onClick={handleTrainModel} disabled={loading}>Test Model</button>
      </div>

      <div className="split right-section">
        {loading && <p>Loading...</p>}
        {result && (

          <div>
            {result && (
              <div>
                <p>Accuracy: {testButton? result.test.accuracy : result.train.accuracy}</p>
                <p>Precision: {testButton ? result.test.precision : result.train.precision}</p>
                <p>F1 Score: {testButton ? result.test.f1_score : result.train.f1_score}</p>
                <p>Confusion Matrix: {JSON.stringify(testButton ? result.test.confusion_matrix : result.train.confusion_matrix)}</p>
                <img src={result.graph} alt="Graph" />
              </div>
            )}
          </div>


        )}
      </div>

    </div>
  );
}

export default Data;


