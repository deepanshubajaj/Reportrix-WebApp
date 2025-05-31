import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SharedLayout from './routes/shared-layout/shared-layout';
import Root from './routes/root/root.route';
import Error from './routes/error/error.route';
import NewsAndTopics from './routes/topics/news-and-topics.route';
import { UserContext } from './context/user-context';
import Auth from './routes/auth/authentication.route';
import SignIn from './pages/signin/signin';
import SignUp from './pages/signup/signup';
import Account from './routes/account/account.route';
import Footer from './components/footer/footer.component';
import ArticleRoute from './routes/article/article.route';
import SplashScreen from './components/splash-screen/splash-screen.component';
import SplashScreenMobile from './components/splash-screen/splash-screen-mobile.component';

function App() {
    const { currentUser } = useContext(UserContext);
    const [showSplash, setShowSplash] = useState(true);
      const [isMobile, setIsMobile] = useState(false);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (showSplash) {
    return isMobile
      ? <SplashScreenMobile onComplete={handleSplashComplete} />
      : <SplashScreen onComplete={handleSplashComplete} />;
  }

    const ProtectedRouteNoLogin = ({ children }) => {
        if (!currentUser) {
            return <Navigate to="/accounts/login" />;
        }

        return children;
    };

    const ProtectedRouteOnLogin = ({ children }) => {
        if (currentUser) {
            return <Navigate to="/" />;
        }

        return children;
    };

    return (
        <Routes>
            <Route path='/' element={<SharedLayout />}>
                <Route index element={
                    <ProtectedRouteNoLogin>
                        <Root />
                        <Footer />
                    </ProtectedRouteNoLogin>
                } />

                <Route path='news/*' element={
                    <ProtectedRouteNoLogin>
                        <NewsAndTopics />
                        <Footer />
                    </ProtectedRouteNoLogin>
                } />

                <Route path='article/*' element={
                    <>
                        <ArticleRoute />
                        <Footer />
                    </>
                } />

                <Route path='accounts' element={
                    <ProtectedRouteOnLogin>
                        <Auth />
                    </ProtectedRouteOnLogin>
                }>
                    <Route index element={<SignIn />} />
                    <Route path='login' element={<SignIn />} />
                    <Route path='register' element={<SignUp />} />
                </Route>

                <Route path='account/*' element={
                    <ProtectedRouteNoLogin>
                        <Account />
                    </ProtectedRouteNoLogin>
                } />

                <Route path='*' element={<Error />} />
            </Route>
        </Routes>
    );
}

export default App;
