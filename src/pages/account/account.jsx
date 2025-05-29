import React, { useContext} from 'react';
import './account.style.scss';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../../lib/utils/firebase.utils';
import { UserContext } from '../../context/user-context';
import Button from '../../components/button/button.component';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import NewsBoxAccountPage from '../../components/news-box-account-page/news-box-account-page.component';

function AccountPage() {
    const navigate = useNavigate();
    const { userDoc, setUserDoc, userBookmarks, loading } = useContext(UserContext);

    if (loading) {
        return (
            <div className='account-page-container'>
                <div className="account-container">
                    <div className="account">
                        <div className="profile-image-container">
                            <div className="loading-placeholder"></div>
                        </div>
                        <div className="user-info">
                            <h1 className='user-name'>Loading...</h1>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userDoc) {
        return (
            <div className='account-page-container'>
                <div className="account-container">
                    <div className="account">
                        <div className="profile-image-container">
                            <div className="loading-placeholder"></div>
                        </div>
                        <div className="user-info">
                            <h1 className='user-name'>No user data available</h1>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const signOutHandler = async () => {
        await signOutUser();
        setUserDoc(null);
        navigate('/accounts');
    }

    const goToUpdateProfilePage =() => {
        navigate('/account/update');
    }

    return (
        <div className='account-page-container'>
            <div className="account-container">
                <div className="account">
                    <div className="profile-image-container">
                        <img 
                            src={userDoc?.photoURL || '/default-profile.png'} 
                            alt={userDoc?.displayName || 'User'} 
                        />
                    </div>

                    <div className="user-info">
                        <h1 className='user-name'>
                            {userDoc?.displayName || 'No name'}
                        </h1>

                        <ul>
                            <li>
                                <h2>Username</h2>
                                <p>{userDoc?.username || 'Not set'}</p>
                            </li>
                            <li>
                                <h2>Phone</h2>
                                <p>{userDoc?.phoneNumber || 'Not set'}</p>
                            </li>
                            <li>
                                <h2>Email</h2>
                                <p>{userDoc?.email || 'Not set'}</p>
                            </li>
                        </ul>
                    </div>

                    <Button 
                        buttonText='Update Profile' 
                        buttonType='simple' 
                        onClick={goToUpdateProfilePage} 
                    />

                    <Button 
                        buttonType='icon' 
                        onClick={goToUpdateProfilePage} 
                        icon={faPencil} 
                    />
                </div>

                <div className="buttons-container">
                    <Button 
                        type='button' 
                        buttonText='Sign Out' 
                        onClick={signOutHandler} 
                    />
                </div>
            </div>

            <div className="user-bookmarks">
                <h1>Bookmarks</h1>

                {Array.isArray(userBookmarks) && userBookmarks.length > 0 ? 
                    <div className="bookmarks-list">
                        {userBookmarks.map((item, index) => {
                            return (
                                <NewsBoxAccountPage 
                                    key={index} 
                                    item={item} 
                                />
                            )
                        })}
                    </div> : 
                    <div className='no-bookmarks'>
                        <h1>No Bookmarks yet!</h1>
                    </div>
                }
            </div>
        </div>
    )
}

export default AccountPage;
