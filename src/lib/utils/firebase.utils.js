import { auth, db, provider } from "../config/firebase";
import { uploadToCloudinary, deleteFromCloudinary, FOLDER_NAME } from "../config/cloudinaryConfig";

import { 
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

import { 
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    getAuth,
    sendPasswordResetEmail as firebaseSendPasswordReset,
    deleteUser
} from 'firebase/auth';

import { v4 as uuidv4 } from 'uuid';
import toast from "react-hot-toast";

// Method to Create User Doc to collections
const createUserDoc = async (user, formData, imageURL, publicId = null) => {
    console.log('Starting createUserDoc with:', { 
        userId: user?.uid, 
        formData: JSON.stringify(formData), 
        imageURL,
        publicId 
    });

    if(!user) {
        console.error('No user provided to createUserDoc');
        throw new Error('No user provided to createUserDoc');
    }

    if(!formData) {
        console.error('No formData provided to createUserDoc');
        throw new Error('No formData provided to createUserDoc');
    }

    // Extract and validate form data
    const {
        firstName = '',
        lastName = '',
        username = '',
        phoneNumber = '',
        email = user.email
    } = formData;

    if (!firstName || !lastName) {
        console.error('Missing required name fields:', { firstName, lastName });
        throw new Error('First name and last name are required');
    }

    // Check if document already exists
    const userDocRef = doc(db, 'usersReportrix', user.uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
        console.log('Document already exists, updating instead of creating');
    }

    console.log('Creating/updating document at path:', userDocRef.path);

    try {
        // Construct the display name
        const displayName = `${firstName.trim()} ${lastName.trim()}`;
        
        const userData = {
            uid: user.uid,
            displayName: displayName,
            email: email,
            photoURL: imageURL || null,
            username: username.trim(),
            phoneNumber: phoneNumber.trim(),
            bookmarks: [],
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add publicId if available
        if (publicId) {
            userData.publicId = publicId;
        }

        // Log the data being saved
        console.log('Attempting to save user data:', JSON.stringify(userData));
        
        // Save to Firestore
        await setDoc(userDocRef, userData);
        console.log('User document saved successfully in Firestore');
        
        // Verify the document was saved with correct data
        const verifySnap = await getDoc(userDocRef);
        if (verifySnap.exists()) {
            const savedData = verifySnap.data();
            console.log('Verified saved data:', JSON.stringify(savedData));
            if (!savedData.displayName || !savedData.email) {
                throw new Error('Required fields missing after save');
            }
        } else {
            console.error('Document was not created in Firestore');
            throw new Error('Document was not created in Firestore');
        }

        return userDocRef;
    }
    catch(err) {
        console.error('Error in createUserDoc:', err);
        throw err;
    }
};

// Method to Create Google User Doc to collections
const createGoogleUserDoc = async (user) => {
    if(!user) return;

    const userDocRef = doc(db, 'usersReportrix', user.uid);

    const userSnapshot = await getDoc(userDocRef);

    if(!userSnapshot.exists()) {
        const { email, uid, displayName, photoURL } = user;

        try {
            await setDoc(userDocRef, {
                uid,
                displayName,
                email,
                photoURL,
                username: '',
                phoneNumber: '',
                bookmarks: [],
            });
        }
        catch(err) {
            console.log(err);
        }
    }

    return userDocRef;
}

// Retrieve user doc
const getUserDocFromCollection = async (userID) => {
    const userDocRef = doc(db, 'usersReportrix', userID);

    const userDoc = await getDoc(userDocRef);

    return userDoc;
}

// Method to Sign User In with Google Popup
const googlePopupSignIn = () => signInWithPopup(auth, provider);

// Method to Sign User Up with Email and Password
const createUserEmailPasswordMethod = async (email, password) => {
    console.log('Starting user creation with email:', email);
    if(!email || !password) {
        console.error('Missing email or password in createUserEmailPasswordMethod');
        throw new Error('Email and password are required');
    }

    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully in Firebase Auth:', result.user.uid);
        return result;
    } catch (error) {
        console.error('Error in createUserEmailPasswordMethod:', error);
        throw error;
    }
}

const addImageToStorage = async (file, formData, user) => {
    console.log('Starting addImageToStorage with:', { 
        hasFile: !!file, 
        formData: JSON.stringify(formData), 
        userId: user?.uid 
    });

    if (!user) {
        console.error('No user provided to addImageToStorage');
        throw new Error('No user provided to addImageToStorage');
    }

    if (!formData || !formData.firstName || !formData.lastName) {
        console.error('Invalid form data provided:', formData);
        throw new Error('Invalid form data provided');
    }

    try {
        let downloadURL = null;
        let public_id = null;

        if (file) {
            console.log('Uploading image to Cloudinary...');
            const result = await uploadToCloudinary(file);
            downloadURL = result.secure_url;
            public_id = result.public_id;
            console.log('Image uploaded successfully:', { downloadURL, public_id });
        }

        // First update the auth profile
        const displayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
        console.log('Updating Firebase auth profile...');
        await updateProfile(user, {
            displayName: displayName,
            photoURL: downloadURL
        });
        console.log('Firebase auth profile updated');

        // Then create the user document
        console.log('Creating user document in Firestore...');
        const userDoc = await createUserDoc(user, formData, downloadURL, public_id);
        console.log('User document created successfully');

        return { downloadURL, userDoc };
    } catch (err) {
        console.error('Error in addImageToStorage:', err);
        throw err;
    }
};

// Method to Sign User In with Email and Password
const signInUserEmailPasswordMethod = async (email, password) => {
    if(!email || !password) {
        return;
    }

    return signInWithEmailAndPassword(auth, email, password);
}

// Method to Sign Out and Clean Up
const signOutUser = async () => {
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // Sign out
            await signOut(auth);
            
            // Clear any local storage or session storage
            localStorage.clear();
            sessionStorage.clear();
            
            console.log('Sign out completed');
            toast.success('Sign out successful!');
        }
    } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Error signing out');
    }
}

// Method to Listen to Auth State Changes
const authStateChangeListener = (callback) => {
    onAuthStateChanged(auth, callback);
}

// Function to update user profile
const updateUserProfile = async (profileDoc, imageFile, id) => {
    const {
        displayName,
        phoneNumber,
        username
    } = profileDoc;

    const userDocRef = doc(db, 'usersReportrix', id);

    try {
        // Get current user document
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }
        const userData = userDoc.data();

        // Prepare update data
        const updateData = {
            displayName: displayName.trim(),
            phoneNumber: phoneNumber.trim(),
            username: username.trim(),
            updatedAt: new Date()
        };

        if (imageFile) {
            // Delete old image if it exists
            if (userData?.publicId) {
                try {
                    await deleteFromCloudinary(userData.publicId);
                    console.log('Old image deleted successfully');
                } catch (deleteErr) {
                    console.error('Error deleting old image:', deleteErr);
                }
            }

            // Upload new image
            const { secure_url, public_id } = await uploadToCloudinary(imageFile);
            
            // Add image data to update object
            updateData.photoURL = secure_url;
            updateData.publicId = public_id;
        }

        // Update Firestore document
        console.log('Updating Firestore with data:', updateData);
        await updateDoc(userDocRef, updateData);

        // Update Firebase Auth display name
        const user = auth.currentUser;
        if (user) {
            await updateProfile(user, {
                displayName: displayName.trim(),
                ...(imageFile && { photoURL: updateData.photoURL })
            });
        }

        // Verify the update
        const verifyDoc = await getDoc(userDocRef);
        if (!verifyDoc.exists()) {
            throw new Error('Failed to verify update');
        }
        const updatedData = verifyDoc.data();
        console.log('Updated user data:', updatedData);

        return true;
    } catch (err) {
        console.error('Error updating profile:', err);
        throw new Error('Failed to update profile: ' + err.message);
    }
}

// Add a product to user's cart
const addArticleToBookmarks = async (item, userID) => {
    if (!userID) {
        console.error('No userID provided to addArticleToBookmarks');
        toast.error('Please log in to bookmark articles');
        return;
    }

    if (!item || !item.title) {
        console.error('Invalid article data provided to addArticleToBookmarks');
        toast.error('Error adding article to bookmarks');
        return;
    }

    const userCartDocRef = doc(db, 'usersReportrix', userID);

    try {
        // Clean the article data before saving
        const cleanedItem = {
            title: item.title,
            description: item.description || '',
            url: item.url || '',
            urlToImage: item.urlToImage || '',
            publishedAt: item.publishedAt || '',
            author: item.author || '',
            content: item.content ? item.content.split('[')[0] : '',
            source: item.source || { name: '' }
        };

        await updateDoc(userCartDocRef, {
            bookmarks: arrayUnion(cleanedItem)
        });
        toast.success('Article added to Bookmarks');
    }
    catch (err) {
        console.error('Error adding article to bookmarks:', err);
        toast.error('Error adding article to Bookmarks');
    }
}

const removeArticleFromBookmarks = async (item, userID) => {
    if (!userID) {
        console.error('No userID provided to removeArticleFromBookmarks');
        toast.error('Please log in to manage bookmarks');
        return;
    }

    if (!item || !item.title) {
        console.error('Invalid article data provided to removeArticleFromBookmarks');
        toast.error('Error removing article from bookmarks');
        return;
    }

    const userCartDocRef = doc(db, 'usersReportrix', userID);

    try {
        // Clean the article data before removing
        const cleanedItem = {
            title: item.title,
            description: item.description || '',
            url: item.url || '',
            urlToImage: item.urlToImage || '',
            publishedAt: item.publishedAt || '',
            author: item.author || '',
            content: item.content ? item.content.split('[')[0] : '',
            source: item.source || { name: '' }
        };

        await updateDoc(userCartDocRef, {
            bookmarks: arrayRemove(cleanedItem)
        });
        toast.success('Article removed from Bookmarks');
    }
    catch (err) {
        console.error('Error removing article from bookmarks:', err);
        toast.error('Error removing article from Bookmarks');
    }
}

// Method to send password reset email
const sendPasswordResetLink = async (email) => {
    const auth = getAuth();
    try {
        await firebaseSendPasswordReset(auth, email);
        toast.success('Password reset link sent to your email!');
        return true;
    } catch (error) {
        console.error('Password reset error:', error);
        switch (error.code) {
            case 'auth/invalid-email':
                toast.error('Invalid email address');
                break;
            case 'auth/user-not-found':
                toast.error('No user found with this email');
                break;
            default:
                toast.error('Error sending reset link');
                break;
        }
        return false;
    }
};

export {
    createGoogleUserDoc,
    getUserDocFromCollection,
    googlePopupSignIn,
    createUserEmailPasswordMethod,
    addImageToStorage,
    signInUserEmailPasswordMethod,
    signOutUser,
    authStateChangeListener,
    updateUserProfile,
    addArticleToBookmarks,
    removeArticleFromBookmarks,
    sendPasswordResetLink
}
