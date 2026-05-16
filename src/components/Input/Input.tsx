import './Input.css';

export interface InputProps {
    placeholder: string; 
    value?: string; 
    onChange?: (value: string) => void;
    disabled?: boolean;
    type?: 'text' | 'number' | 'password';
}

export default function Input({ placeholder, value, onChange, disabled, type = 'text' }: InputProps) {
    return (
        <input
            className='input'
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            type={type}
            onChange={(e) => onChange ? onChange(e.target.value) : null}
        />
    );
}