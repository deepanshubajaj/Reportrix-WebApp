import React, { useState } from 'react';
import './form-input.style.scss';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function FormInput({ labelText, inputOptions, errorText }) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isPasswordField = inputOptions.type === 'password';
    const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : inputOptions.type;

    return (
        <div className='form-group'>
            <div className='input-container'>
                <input 
                    className='form-input' 
                    {...inputOptions}
                    type={inputType}
                />
                {isPasswordField && (
                    <button 
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                        tabIndex="-1"
                    >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                )}
            </div>

            {labelText && 
            <label 
                htmlFor={inputOptions.id} 
                className={`form-input-label ${inputOptions?.value?.length ? 'shrink' : ''}`}>
            {labelText}
            </label>}

            {errorText && <p className='error-text'>{errorText}</p>}
        </div>
    );
}

export default FormInput;