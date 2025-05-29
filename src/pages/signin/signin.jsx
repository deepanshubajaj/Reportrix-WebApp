import React, { useContext, useState, useEffect } from 'react';
import './signin.style.scss';
import { createGoogleUserDoc, googlePopupSignIn, signInUserEmailPasswordMethod, sendPasswordResetLink } from '../../lib/utils/firebase.utils';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../lib/utils/utils';
import FormInput from '../../components/form-input/form-input.component';
import Button from '../../components/button/button.component';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchNews } from '../../features/newsSlice';
import { fetchCateredNews } from '../../features/cateredNewsSlice';
import { PulseLoader } from 'react-spinners';
import { UserContext } from '../../context/user-context';

function SignIn() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useContext(UserContext);

    const handleClick = () => {
        navigate("/accounts/register");
    };

    const defaultFormFields = {
        email: '',
        password: ''
    };

    const defaultFormErrors = {
        email: '',
        password: '',
    };

    const [formInputs, setFormInputs] = useState(defaultFormFields);
    const [formErrors, setFormErrors] = useState(defaultFormErrors);

    const [resetTimer, setResetTimer] = useState(0);
    const [isResetDisabled, setIsResetDisabled] = useState(false);

    useEffect(() => {
        let timer;
        if (resetTimer > 0) {
            timer = setInterval(() => {
                setResetTimer(prev => prev - 1);
            }, 1000);
        } else {
            setIsResetDisabled(false);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [resetTimer]);

    const handleForgotPassword = async (e) => {
        e.preventDefault(); // Prevent form submission
        console.log('Forgot password clicked');
        
        const { email } = formInputs;
        console.log('Email value:', email);
        
        // Clear previous errors
        setFormErrors(prev => ({
            ...prev,
            email: ''
        }));
        
        // Check if email is empty
        if (!email || !email.trim()) {
            console.log('Email is empty');
            setFormErrors(prev => ({
                ...prev,
                email: 'Please enter your email address'
            }));
            return;
        }
        
        // Validate email format
        const emailError = validateEmail(email.trim());
        if (emailError) {
            console.log('Email validation error:', emailError);
            setFormErrors(prev => ({
                ...prev,
                email: emailError
            }));
            return;
        }

        try {
            console.log('Attempting to send reset link...');
            setIsResetDisabled(true);
            const success = await sendPasswordResetLink(email.trim());
            console.log('Reset link result:', success);
            
            if (success) {
                setResetTimer(30);
            } else {
                setIsResetDisabled(false);
            }
        } catch (error) {
            console.error('Error sending reset link:', error);
            toast.error('Failed to send reset link. Please try again.');
            setIsResetDisabled(false);
        }
    };

    // Function to fetch fresh news data
    const fetchFreshNews = async () => {
        try {
            await dispatch(fetchNews()).unwrap();
            // Fetch general news category as it's the default view
            await dispatch(fetchCateredNews('General')).unwrap();
        } catch (error) {
            console.error('Error fetching fresh news:', error);
        }
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormInputs({...formInputs, [name]: value});
    }

    const submitHandler = async (e) => {
        e.preventDefault();

        const validationErrors = {};

        // Check if email is empty or invalid
        const emailError = validateEmail(formInputs.email.trim());
        if (emailError) {
            validationErrors.email = emailError;
        }

        // Check if password is empty
        if (!formInputs.password.trim()) {
            validationErrors.password = 'Password is required';
        }

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        try {
            await signInUserEmailPasswordMethod(formInputs.email.trim(), formInputs.password);
            await fetchFreshNews();
            toast.success('Sign in successful!');
        } catch (err) {
            console.error('Sign in error:', err);
            if (err.code === 'auth/user-not-found') {
                validationErrors.email = 'No user found with this email';
                setFormErrors(validationErrors);
                return;
            }
            if (err.code === 'auth/invalid-login-credentials') {
                validationErrors.email = 'Invalid Login Credentials';
                validationErrors.password = 'Invalid Login Credentials';
                setFormErrors(validationErrors);
                return;
            }
            else if (err.code === 'auth/wrong-password') {
                validationErrors.password = 'Incorrect password';
                setFormErrors(validationErrors);
                return;
            }
            toast.error('Error signing in. Please try again.');
        }
    };

    const googleSignInHandler = async () => {
        try {
            const { user } = await googlePopupSignIn();
            await createGoogleUserDoc(user);
            await fetchFreshNews();
            toast.success('Sign in successful!');
        } catch (error) {
            toast.error('Error signing in!');
        }
    }

    const fillWithSampleCredentials = (email, pass) => {
        setFormInputs({
            email: email,
            password: pass,
        });
    };

    return (
        <div className='sign-in-container'>
            <div className='sign-in-form-container'>
                <h2>Sign In</h2>

                <form onSubmit={submitHandler}>
                    <FormInput 
                        labelText='Email' 
                        errorText={formErrors.email} 
                        inputOptions={{
                            type: 'email',
                            required: true,
                            id: 'email',
                            name: 'email',
                            onChange: changeHandler,
                            value: formInputs.email,
                            autoComplete: 'email'
                        }}
                    />

                    <FormInput 
                        labelText='Password' 
                        errorText={formErrors.password} 
                        inputOptions={{
                            type: 'password',
                            required: true,
                            id: 'password',
                            name: 'password',
                            onChange: changeHandler,
                            value: formInputs.password,
                            autoComplete: 'current-password'
                        }}
                    />

                    <div className="buttons-container">
                        {loading ? 
                        <div className="loader">
                            <PulseLoader size='6' color="#1DB954" />
                        </div> : 
                        <>
                            <Button 
                                buttonType='submit' 
                                buttonText='Sign In' 
                                onClick={submitHandler}
                            />

                            <div className='divider'>
                                <hr />
                                <span>OR</span>
                                <hr />
                            </div>

                            <Button 
                                type='button' 
                                buttonType='blue' 
                                buttonText='Sign In With Google' 
                                onClick={googleSignInHandler} 
                            />

                            <Button 
                                buttonText={resetTimer > 0 ? `Resend in ${resetTimer}s` : 'Forgot Password?'}
                                type='button'
                                buttonType='simple'
                                onClick={handleForgotPassword}
                                disabled={isResetDisabled}
                            />
                        </>}
                    </div>
                </form>
            </div>

            <div className="go-to-register">
                <h2>Don't have an account? 
                    <span onClick={handleClick}> Sign Up</span>
                </h2>
            </div>

            <table className="credentials">
                <thead
                onClick={() => fillWithSampleCredentials(
                    process.env.REACT_APP_USER1_EMAIL,
                    process.env.REACT_APP_USER1_PASSWORD
                )} 
                >
                    <tr>
                        <th>User-1 credentials</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Email</td>
                        <td>{process.env.REACT_APP_USER1_EMAIL}</td>
                    </tr>
                    <tr>
                        <td>Password</td>
                        <td>{process.env.REACT_APP_USER1_PASSWORD}</td>
                    </tr>
                </tbody>
            </table>

            <table className="credentials">
                <thead
                onClick={() => fillWithSampleCredentials(
                    process.env.REACT_APP_USER2_EMAIL,
                    process.env.REACT_APP_USER2_PASSWORD
                )} 
                >
                    <tr>
                        <th>User-2 credentials</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Email</td>
                        <td>{process.env.REACT_APP_USER2_EMAIL}</td>
                    </tr>
                    <tr>
                        <td>Password</td>
                        <td>{process.env.REACT_APP_USER2_PASSWORD}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default SignIn;
