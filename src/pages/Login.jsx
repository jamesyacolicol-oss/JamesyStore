import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
    // Initializing state with phone and password to match backend requirements
    const [credentials, setCredentials] = useState({ phone: '', password: '' });
    const [modal, setModal] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                phone: credentials.phone.trim(),
                password: credentials.password,
            });
            
            localStorage.setItem('token', response.data.token);
            setModal({ show: true, message: 'Login successful!', type: 'success' });
            
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            setModal({ show: true, message: 'Invalid phone number or password.', type: 'failed' });
        }
    };

    return (
        <div className="login-page-wrapper">
            <form className="login-form" onSubmit={handleLogin}>
                <h2 className="login-title">Jamesy Store</h2>
                <input 
                    type="text" 
                    placeholder="Phone Number" 
                    value={credentials.phone}
                    onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    required 
                />
                <button type="submit">Login</button>
            </form>

            {modal.show && (
                <div className="modal-overlay">
                    <div className={`modal-box ${modal.type}`}>
                        <p>{modal.message}</p>
                        {modal.type === 'failed' && (
                            <button onClick={() => setModal({ ...modal, show: false })}>Close</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
