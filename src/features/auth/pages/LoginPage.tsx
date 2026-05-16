import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../../../components/Input/Input';
import { useAuth } from '../../../context/AuthContext';
import { login as loginApi } from '../auth.api';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      toast.error('Please enter username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(username.trim(), password);

      if (!response?.success || !response?.data?.token || !response?.data?.user) {
        toast.error(response?.message || 'Login failed.');
        return;
      }

      login(response.data.token, response.data.user);
      toast.success('Login successful.');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <h1>Login</h1>

      <form className='login-form' onSubmit={handleSubmit}>
        <div className='input-control'>
          <div className='label'>Username</div>
          <Input
            placeholder='Enter your username'
            value={username}
            onChange={setUsername}
          />
        </div>
        <div className='input-control'>
          <div className='label'>Password</div>
          <Input
            placeholder='Enter your password'
            type='password'
            value={password}
            onChange={setPassword}
          />
        </div>
        <button type='submit' className='button primary login-submit-btn' disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
