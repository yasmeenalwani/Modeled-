import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
Amplify.configure(outputs);
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
const buttonStyle = {
  margin: '0 1rem',
  padding: '1rem 2rem',
  fontSize: '1rem',
  cursor: 'pointer',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#f6f2aaff',
  color: '#942c2cff'
};
function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>Modeled Management</h1>
      <p>Join the Community</p>
      <div style={{ marginTop: '2rem' }}>
        <button style={buttonStyle}>Model</button>
        <button style={buttonStyle}>Professional</button>
        <button style={buttonStyle}>Partner</button>
      </div>
    </div>
  );
}

export default App;

