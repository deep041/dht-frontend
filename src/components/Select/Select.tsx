import './Select.css';

export default function Select({ options, placeholder, value, onChange }: { options: any[], placeholder?: string, value?: string, onChange?: (value: string | number) => void }) {
    return (
        <select className='select' value={value} onChange={(e) => onChange ? onChange(e.target.value) : null}>
            <option value="">{ placeholder ? placeholder  : 'Select an option'}</option>
            {options.map((option) => (
                <option key={option.key} value={option.value}>{option.key}</option>
            ))}
        </select>
    );
}