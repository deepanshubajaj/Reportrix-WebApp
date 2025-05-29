import React, { useContext, useState } from 'react';
import './signup.style.scss';
import { addImageToStorage, createUserEmailPasswordMethod, signOutUser } from '../../lib/utils/firebase.utils';
import { validateUsername, validateEmail, validatePassword, validatePhoneNumber } from '../../lib/utils/utils';
import { useNavigate } from 'react-router-dom';
import AddPhotoAlternateTwoToneIcon from '@mui/icons-material/AddPhotoAlternateTwoTone';
import { PulseLoader } from 'react-spinners';
import { UserContext } from '../../context/user-context';
import FormInput from '../../components/form-input/form-input.component';
import Button from '../../components/button/button.component';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchNews } from '../../features/newsSlice';
import { fetchCateredNews } from '../../features/cateredNewsSlice';
import { auth } from '../../lib/config/firebase';

function SignUp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useContext(UserContext);

    const handleClick = () => {
        navigate("/accounts/login");
    };

    const defaultFormFields = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    };

    const defaultFormErrors = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        image: ''
    };

    const [formInputs, setFormInputs] = useState(defaultFormFields);
    const [formErrors, setFormErrors] = useState(defaultFormErrors);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

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
        if (name === 'phoneNumber') {
            // Only allow numbers and limit to 10 digits
            const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormInputs({...formInputs, [name]: numbersOnly});
        } else {
            setFormInputs({...formInputs, [name]: value});
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1000000) {
                setFormErrors({
                    ...formErrors,
                    image: '*Please select a file less than 1MB'
                });
                setSelectedImage(null);
                setPreviewUrl(null);
                return;
            }

            setSelectedImage(file);
            setFormErrors({
                ...formErrors,
                image: ''
            });

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log('Starting signup submission...');

        const validationErrors = {};

        if(!formInputs.firstName.trim()) {
            validationErrors.firstName = 'First name is required';
        }

        if(!formInputs.lastName.trim()) {
            validationErrors.lastName = 'Last name is required';
        }

        if(!formInputs.email.trim()) {
            validationErrors.email = 'Email is required';
        }
        else {
            const emailError = validateEmail(formInputs.email.trim());
            if (emailError) {
                validationErrors.email = emailError;
            }
        }

        if(!formInputs.phoneNumber.trim()) {
            validationErrors.phoneNumber = 'Phone number is required';
        }
        else if(!validatePhoneNumber(formInputs.phoneNumber.trim())) {
            validationErrors.phoneNumber = 'Invalid Phone number';
        }

        if(!formInputs.password.trim()) {
            validationErrors.password = 'Password is required';
        }
        else if(!validatePassword(formInputs.password.trim())) {
            validationErrors.password = 'Must be at least 6 or more characters';
        }

        if(!formInputs.confirmPassword.trim()) {
            validationErrors.confirmPassword = 'Password is required';
        }
        else if(formInputs.confirmPassword.trim() !== formInputs.password.trim()) {
            validationErrors.confirmPassword = 'Password doesn\'t match';
        }

        if(!formInputs.username.trim()) {
            validationErrors.username = 'Username is required';
        }
        else if(!validateUsername(formInputs.username.trim())) {
            validationErrors.username = 'Special characters not allowed';
        }

        if(!selectedImage) {
            validationErrors.image = '*Please select a profile image';
        }

        if(Object.keys(validationErrors).length === 0) {
            setFormErrors(defaultFormErrors);

            try {
                // Force sign out and cleanup any existing session
                if (auth.currentUser) {
                    console.log('Found existing auth state, cleaning up...');
                    await signOutUser();
                    // Add a small delay to ensure cleanup is complete
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                console.log('Creating new user account...');
                const { user } = await createUserEmailPasswordMethod(formInputs.email, formInputs.password);
                console.log('User account created:', user.uid);

                console.log('Starting profile setup with data:', {
                    hasImage: !!selectedImage,
                    email: formInputs.email,
                    firstName: formInputs.firstName,
                    lastName: formInputs.lastName
                });

                const result = await addImageToStorage(selectedImage, formInputs, user);
                console.log('Profile setup completed:', result);
                
                console.log('Fetching initial news...');
                await fetchFreshNews();
                console.log('Initial news fetched');
                
                toast.success('Signed up successfully!');
                navigate('/');
            } catch(err) {
                console.error('Signup error:', err);
                
                if(err.code === 'auth/email-already-in-use') {
                    validationErrors.email = 'Email already in use!';
                    setFormErrors(validationErrors);
                    return;
                }
                
                // Handle specific error cases
                if(err.message?.includes('Firestore')) {
                    toast.error('Error saving user data. Please try again.');
                } else if(err.message?.includes('upload')) {
                    toast.error('Error uploading profile image. Please try again.');
                } else {
                    toast.error(err.message || 'Failed to complete signup');
                }
                
                // Attempt cleanup if something went wrong
                try {
                    if (auth.currentUser) {
                        await signOutUser();
                    }
                } catch (cleanupError) {
                    console.error('Error during error cleanup:', cleanupError);
                }
            }
        } else {
            setFormErrors(validationErrors);
        }
    }

    return (
        <div className="sign-up-container">
            <div className='sign-up-form-container'>
                <h2>Sign Up</h2>

                <form id='registeration-form' onSubmit={submitHandler}>
                    <FormInput 
                        labelText='First Name*' 
                        errorText={formErrors.firstName} 
                        inputOptions={{
                            type: 'text',
                            id: 'firstName',
                            name: 'firstName',
                            onChange: changeHandler,
                            value: formInputs.firstName
                        }}
                    />

                    <FormInput 
                        labelText='Last Name*' 
                        errorText={formErrors.lastName} 
                        inputOptions={{
                            type: 'text',
                            id: 'lastName',
                            name: 'lastName',
                            onChange: changeHandler,
                            value: formInputs.lastName
                        }}
                    />

                    <FormInput 
                        labelText='Email*' 
                        errorText={formErrors.email} 
                        inputOptions={{
                            type: 'email',
                            id: 'email',
                            name: 'email',
                            onChange: changeHandler,
                            value: formInputs.email
                        }}
                    />

                    <FormInput 
                        labelText='Phone Number*' 
                        errorText={formErrors.phoneNumber} 
                        inputOptions={{
                            type: 'tel',
                            id: 'phoneNumber',
                            name: 'phoneNumber',
                            onChange: changeHandler,
                            value: formInputs.phoneNumber,
                            maxLength: 10,
                            pattern: '[0-9]{10}'
                        }}
                    />

                    <FormInput 
                        labelText='Password*' 
                        errorText={formErrors.password} 
                        inputOptions={{
                            type: 'password',
                            id: 'password',
                            name: 'password',
                            onChange: changeHandler,
                            value: formInputs.password
                        }}
                    />

                    <FormInput 
                        labelText='Confirm Password*' 
                        errorText={formErrors.confirmPassword} 
                        inputOptions={{
                            type: 'password',
                            id: 'confirmPassword',
                            name: 'confirmPassword',
                            onChange: changeHandler,
                            value: formInputs.confirmPassword
                        }}
                    />

                    <FormInput 
                        labelText='Username*' 
                        errorText={formErrors.username} 
                        inputOptions={{
                            type: 'text',
                            id: 'username',
                            name: 'username',
                            onChange: changeHandler,
                            value: formInputs.username
                        }}
                    />

                    <div className="image-input-group">
                        <div className="image-input-container">
                            <label htmlFor='image'>
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Profile preview" 
                                        className="image-preview"
                                    />
                                ) : (
                                    <>
                                        <AddPhotoAlternateTwoToneIcon />
                                        <span>Add an image*</span>
                                    </>
                                )}
                            </label>
                            <input 
                                className='image-input' 
                                type='file' 
                                id='image' 
                                name='image'
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <span>*Max size: 1MB</span>
                        </div>
                        <span className="error">{formErrors.image}</span>
                    </div>
                </form>

                {loading ? 
                <div className="loader">
                    <PulseLoader size='6' color="#1DB954" />
                </div> : 
                <Button 
                    form='registeration-form'
                    buttonText='Sign Up' 
                    type='submit' 
                />}
            </div>

            <div className="go-to-login">
                <h2>Already have an account?
                    <span onClick={handleClick}> Sign In</span>
                </h2>
            </div>
        </div>
    )
}

export default SignUp;