import { createContext, useEffect, useState } from "react";
import { authStateChangeListener } from '../lib/utils/firebase.utils';
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/config/firebase";

export const UserContext = createContext({
    currentUser: null,
    setCurrentUser: () => null,
    userDoc: null,
    setUserDoc: () => null,
    loading: false,
    userBookmarks: []
});

export const UserContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);
    const [userDoc, setUserDoc] = useState(null);
    const [userBookmarks, setUserBookmarks] = useState([]);

    useEffect(() => {
        const unsubscribe = authStateChangeListener((user) => {
            if (user) {
                setCurrentUser(user);
                setLoading(false);
            } else {
                setCurrentUser(null);
                setUserDoc(null);
                setUserBookmarks([]);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        try {
            const getUserDoc = async () => {
                const userCollection = collection(db, 'usersReportrix');
                const userDocRef = doc(userCollection, currentUser.uid);
                
                const unsub = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserDoc(snapshot.data());
                        setUserBookmarks(snapshot.data()?.bookmarks || []);
                    } else {
                        // If user doc doesn't exist, create it
                        const userData = {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: currentUser.photoURL,
                            username: '',
                            phoneNumber: '',
                            bookmarks: []
                        };
                        
                        setDoc(userDocRef, userData)
                            .then(() => {
                                setUserDoc(userData);
                                setUserBookmarks([]);
                            })
                            .catch(err => {
                                console.error('Error creating user doc:', err);
                                setUserDoc(null);
                                setUserBookmarks([]);
                            });
                    }
                });
    
                return unsub;
            }
    
            if (currentUser) {
                getUserDoc();
            } else {
                setUserDoc(null);
            }
        }
        catch(err) {
            console.log('Error getting user doc:', err);
            setUserDoc(null);
        }
    }, [currentUser]);

    const contextValue = {
        currentUser,
        setCurrentUser,
        userDoc,
        setUserDoc,
        loading,
        userBookmarks
    };

    return (
        <UserContext.Provider value={ contextValue }>
            { children }
        </UserContext.Provider>
    )
}