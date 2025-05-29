import React, { useContext, useEffect, useState } from 'react';
import './update-profile.style.scss';
import AddPhotoAlternateTwoToneIcon from '@mui/icons-material/AddPhotoAlternateTwoTone';
import { PulseLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { validateUsername, validatePhoneNumber } from '../../lib/utils/utils';
import { UserContext } from '../../context/user-context';
import { updateUserProfile } from '../../lib/utils/firebase.utils';
import FormInput from '../../components/form-input/form-input.component';
import Button from '../../components/button/button.component';
import toast from 'react-hot-toast';

function UpdateProfile() {
    const navigate = useNavigate();
    const { userDoc } = useContext(UserContext);

    const goToAccountPage = () => {
        navigate('/account');
    }

    const [formInputs, setFormInputs] = useState({
        displayName: '',
        phoneNumber: '',
        photoURL: '',
        username: ''
    });

    const defaultFormErrors = {
        displayName: '',
        phoneNumber: '',
        username: '',
        image: ''
    };

    const [formErrors, setFormErrors] = useState(defaultFormErrors);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber') {
            // Only allow numbers and limit to 10 digits
            const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormInputs({ ...formInputs, [name]: numbersOnly });
        } else {
            setFormInputs({ ...formInputs, [name]: value });
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

        const validationErrors = {};

        if (!formInputs.displayName.trim()) {
            validationErrors.displayName = 'Display name is required';
        }

        if (!formInputs.phoneNumber.trim()) {
            validationErrors.phoneNumber = 'Phone number is required';
        } else if (!validatePhoneNumber(formInputs.phoneNumber.trim())) {
            validationErrors.phoneNumber = 'Invalid Phone number';
        }

        if (!formInputs.username.trim()) {
            validationErrors.username = 'username is required';
        }
        else if (!validateUsername(formInputs.username.trim())) {
            validationErrors.username = 'Special characters not allowed';
        }

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        if (Object.keys(validationErrors).length === 0) {
            setFormErrors(defaultFormErrors);
            setIsLoading(true);
            try {
                const success = await updateUserProfile(formInputs, selectedImage, userDoc.uid);
                if (success) {
                    toast.success('Profile updated successfully!');
                    navigate('/account');
                }
            }
            catch (err) {
                toast.error(err.message || 'Failed to update profile');
            }
            finally {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        try {
            setFormInputs({
                displayName: userDoc.displayName,
                phoneNumber: userDoc.phoneNumber,
                photoURL: userDoc.photoURL,
                username: userDoc.username
            });
            // Set the current profile photo as preview
            setPreviewUrl(userDoc.photoURL);
        }
        catch (err) {
            toast.error('Error loading profile data');
        }
    }, [userDoc])

    return (
        <div className='update-profile-page-container'>
            <div className='update-profile-form-container'>
                <h2>Update Profile</h2>

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
                                    <span>Change photo</span>
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

                <form onSubmit={submitHandler}>
                    <FormInput
                        labelText='Display Name'
                        errorText={formErrors.displayName}
                        inputOptions={{
                            type: 'text',
                            required: true,
                            id: 'displayName',
                            name: 'displayName',
                            onChange: changeHandler,
                            value: formInputs.displayName
                        }}
                    />

                    <FormInput
                        labelText='Phone Number'
                        errorText={formErrors.phoneNumber}
                        inputOptions={{
                            type: 'tel',
                            required: true,
                            id: 'phoneNumber',
                            name: 'phoneNumber',
                            onChange: changeHandler,
                            value: formInputs.phoneNumber,
                            maxLength: 10,
                            pattern: '[0-9]{10}'
                        }}
                    />

                    <FormInput
                        labelText='Username'
                        errorText={formErrors.username}
                        inputOptions={{
                            type: 'text',
                            required: true,
                            id: 'username',
                            name: 'username',
                            onChange: changeHandler,
                            value: formInputs.username
                        }}
                    />

                    <div className="buttons-container">
                        {isLoading ?
                            <div className="loader">
                                <PulseLoader size='6' color="#1DB954" />
                            </div> :
                            <>
                                <Button
                                    buttonType='submit'
                                    buttonText='Update Profile'
                                />

                                <Button
                                    type='button'
                                    buttonType='red'
                                    buttonText='Cancel'
                                    onClick={goToAccountPage}
                                />
                            </>}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateProfile;
