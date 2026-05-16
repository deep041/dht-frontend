import './Button.css';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    type?: 'primary' | 'secondary';
    buttonClass?: string;
}

export default function Button({ text, onClick, type = 'primary', buttonClass }: ButtonProps) {
    return (
        <>
            {type === 'primary' && <button className={'button primary ' + buttonClass} onClick={onClick}>{text}</button>}
        </>
    );
}