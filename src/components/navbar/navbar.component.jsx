import React, { useContext, useEffect } from 'react';
import './navbar.style.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCateredNews } from '../../features/cateredNewsSlice';
import { UserContext } from '../../context/user-context';

const categories = [
  'General',
  'Business',
  'Entertainment',
  'Health',
  'Science',
  'Sports',
  'Technology',
];

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const cateredNews = useSelector((state) => state.cateredNews.news);

  const { currentUser, userDoc } = useContext(UserContext);

  // Only fetch the current category if not already in cache
  useEffect(() => {
    const currentCategory = currentPathCategory;
    if (currentCategory && !cateredNews[currentCategory]) {
      dispatch(fetchCateredNews(currentCategory));
    }
  }, [dispatch, location.pathname, cateredNews]);

  const goToBookmarks = () => {
    if (!currentUser) {
      alert('Please log in to view bookmarks');
      return;
    }
    navigate('/account/bookmarks');
  };

  const goToCategoryPage = (category) => {
    const lowerCaseCategory = category.toLowerCase();
    // Pre-fetch the category data before navigation
    if (!cateredNews[category]) {
      dispatch(fetchCateredNews(category));
    }
    if (lowerCaseCategory === 'general') {
      navigate('/news');
    } else {
      navigate(`/news/${category}`);
    }
  };

  // Determine active category for styling
  const currentPathCategory = (() => {
    if (location.pathname === '/news' || location.pathname === '/') return 'General';
    if (location.pathname.startsWith('/news/')) {
      return location.pathname.split('/news/')[1];
    }
    if (location.pathname === '/account/bookmarks') return 'Bookmarks';
    return null;
  })();

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="nav-link">
          <img
            className="nav-logo"
            src="https://brandlogos.net/wp-content/uploads/2022/09/autodesk_revit-logo_brandlogos.net_4hpe4-512x512.png"
            alt="Logo"
          />
          <h1 className="nav-title">Reportrix</h1>
        </Link>

        {currentUser && (
          <ul className="nav-links-container">
            <li>
              <Link to="/account/bookmarks" className="nav-link">
                Bookmarks
              </Link>
            </li>
            <li>
              <Link to="/account" className="nav-link user-link">
                <img
                  src={userDoc?.photoURL || currentUser?.photoURL || '/default-profile.png'}
                  alt={userDoc?.displayName || currentUser?.displayName || 'User'}
                />
                <span>{userDoc?.username || currentUser?.displayName || 'User'}</span>
              </Link>
            </li>
          </ul>
        )}
      </nav>

      {currentUser && (
        <div className="topics-bar" id="topics-bar">
          <span
            className={`topic${currentPathCategory === 'Bookmarks' ? ' active' : ''}`}
            onClick={goToBookmarks}
            style={{ cursor: 'pointer' }}
          >
            Bookmarks
          </span>
          {categories.map((category) => (
            <span
              key={category}
              className={`topic${currentPathCategory === category ? ' active' : ''}`}
              onClick={() => goToCategoryPage(category)}
              style={{ cursor: 'pointer' }}
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default Navbar;
