import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import './LoginPage.css'

export default function LoginPage() {
  return (
    <div className='login-page'>
      <h1>Login Page</h1>
      
      <form className='login-form'>
        <div className='input-control'>
          <div className='label'>Username:</div>
          <Input placeholder='Enter your username'></Input>
        </div>
        <div className='input-control'>
          <div className='label'>Password:</div>
          <Input placeholder='Enter your password'></Input>
        </div>
        <Button text='Login' onClick={() => {}}></Button>
      </form>
    </div>
  );
}