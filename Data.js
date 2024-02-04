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
    formData.append('algo_name',algorithm);
    formData.append('file', file);
    formData.append('target_var',target);

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate',formData, {
        params : { algo_name: algorithm,
        filepath: file.name,
        target_var: target,
       
        }//model_kwargs: {},
        // Add other parameters from your ModelSchema as needed
      });

      const responseData = response.data;
      setColumnNames(responseData.columns);
      setData(responseData.data);
      setResult(responseData.result);
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
            <option value="Random Forest">Random Forest</option>
          </select>
        </label>
        <br />
        <button onClick={handleTrainModel} disabled={loading}>Train Model</button>
      </div>

      <div className="split right-section">
        {loading && <p>Loading...</p>}
        {result && (
          <div>
            <p>Accuracy: {result.accuracy}</p>
            <p>Precision: {result.precision}</p>
            <p>F1 Score: {result.f1_score}</p>
            <p>Confusion Matrix: {JSON.stringify(result.confusion_matrix)}</p>
            <img src={result.graph} alt="Graph" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Data;



































// import React, { useState } from 'react';
// import Dropzone from 'react-dropzone';
// import axios from 'axios';
// import Papa from 'papaparse';
// import './Data.css';

// function Data() {
//     const [file, setFile] = useState(null);
//     const [target, setTarget] = useState('');
//     const [algorithm, setAlgorithm] = useState('');
//     const [columnNames, setColumnNames] = useState([]);
//     const [data, setData] = useState([]);
//     const [result, setResult] = useState(null);

//     const handleFileDrop = async (acceptedFiles) => {
//         const selectedFile = acceptedFiles[0];

//         // Check if the dropped file is a CSV file
//         if (selectedFile && selectedFile.type === 'text/csv') {

//             setFile(selectedFile);
//             // Use papaparse to parse the CSV file and get the column names and data
//             Papa.parse(selectedFile, {
//                 header: true,
//                 dynamicTyping: true,
//                 complete: (result) => {
//                     const firstRow = result.data[0];
//                     if (firstRow) {
//                         const columns = Object.keys(firstRow);
//                         setColumnNames(columns);
//                         setData(result.data);
//                         console.log('Column Names:', columns);
//                         console.log('Data:', result.data);
//                     }
//                 },
//             });
//         }
//         else {
//             alert("Input .csv only!!")
//         }
//     };

//     const handleTrainModel = async () => {
//         if (!file || !target || !algorithm) {
//             alert('Please select a CSV file, target variable, and algorithm.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             const response = await axios.post('http://localhost:5000/train', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//                 params: {
//                     target: target,
//                     algorithm: algorithm,
//                 },
//             });

//             const responseData = response.data;
//             setColumnNames(responseData.columns); // Assuming the backend returns column names
//             setData(responseData.data);
//             setResult(responseData.result);

//         } catch (error) {
//             console.error('Error:', error);
//         }
//     };


//     return (
//         <div className="container">
//             <div className="split left-section">
//                 <Dropzone onDrop={handleFileDrop} accept=".csv">
//                     {({ getRootProps, getInputProps }) => (
//                         <div {...getRootProps()} style={{ border: '1px dashed  #383f51', padding: '20px', textAlign: 'center' }}>
//                             <input {...getInputProps()} />
//                             {file ? `Selected CSV File: ${file.name}` : "Drag 'n' drop a CSV file here, or click to select one"}
//                         </div>
//                     )}
//                 </Dropzone>
//                 <br />


//                 {data.length > 0 && (
//                     <div className='Table'>
//                         <p>Data:</p>

//                         <table>
//                             <thead>
//                                 <tr>
//                                     {columnNames.map((columnName, index) => (
//                                         <th key={index}>{columnName}</th>
//                                     ))}
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {data.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {columnNames.map((columnName, columnIndex) => (
//                                             <td key={columnIndex}>{row[columnName]}</td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>

//                         </table>
//                     </div>
//                 )}
//                 {columnNames.length > 0 && (
//                     <label>
//                         Target Variable:
//                         <select value={target} onChange={(e) => setTarget(e.target.value)}>
//                             <option value="">Select Target Variable</option>
//                             {columnNames.map((columnName, index) => (
//                                 <option key={index} value={columnName}>
//                                     {columnName}
//                                 </option>
//                             ))}
//                         </select>
//                     </label>
//                 )}
//                 <br />
//                 <label>
//                     Algorithm:
//                     <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
//                         <option value="">Select Algorithm</option>
//                         <option value="RandomForest">Random Forest</option>
//                     </select>
//                 </label>
//                 <br />
//                 <button onClick={handleTrainModel}>Train Model</button>
//             </div>
//             <div className="split right-section">
//                 {result && (
//                     <div>
//                         <p>Accuracy: {result.accuracy}</p>
//                         <p>Precision: {result.precision}</p>
//                         <p>F1 Score: {result.f1_score}</p>
//                         <p>Confusion Matrix: {JSON.stringify(result.confusion_matrix)}</p>
//                         <img src={result.graph} alt="Graph" />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

// };
// export default Data;




{/* <Select
                        options={[{ value: 'algorithm1', label: 'Logistic Regression' }, { value: 'algorithm2', label: 'K-Nearest Neighbours' }, { value: 'algorithm3', label: 'Random Forest' }, { value: 'algorithm4', label: 'Decision Tree' }]}
                        value={selectedAlgorithm}
                        onChange={setSelectedAlgorithm}
                        placeholder="Select algorithm to train model"
                        style={{ marginTop: '20px' }}
                    /> */}

{/* {columnNames.length > 0 && (
          <div>
            <p>Column Names:</p>
            <ul>
              {columnNames.map((columnName, index) => (
                <li key={index}>{columnName}</li>
              ))}
            </ul>
          </div>
        )} */}