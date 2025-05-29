import React, { useEffect } from 'react';
import './topic-based-news.style.scss';
import { useSelector, useDispatch } from 'react-redux';
import NewsBox from '../../components/news-box/news-box.component';
import { useLocation } from 'react-router-dom';
import { fetchCateredNews } from '../../features/cateredNewsSlice';

function TopicBasedNews() {
    const { news, loading, error } = useSelector((state) => state.cateredNews);
    const dispatch = useDispatch();
    const location = useLocation();

    const rawCategory = location.pathname.split('/news/')[1];
    const category = rawCategory.toLowerCase(); // ✅ normalize
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

    const newsContent = news?.[category] || [];

    // Scroll to top on mount and dispatch if news not loaded
    useEffect(() => {
        window.scrollTo(0, 0);
        console.log('Fetching news for category:', category);

        if (!news?.[category]) {
            dispatch(fetchCateredNews(category)); // Pass lowercase category for API consistency
            console.log('Dispatching fetchCateredNews for:', category);
        }
    }, [dispatch, category, formattedCategory, news]);

    return (
        <div className='topic-based-news-container'>
            <div className="topic-news-container">
                <h1 className='title'>News On {formattedCategory}</h1>

                {loading === 'loading' && <p>Loading news...</p>}
                {loading === 'failed' && <p>Error: {error}</p>}

                {loading === 'succeeded' && newsContent.length > 0 ? (
                    newsContent
                        .filter(item => item.urlToImage)
                        .map((item) => (
                            <NewsBox 
                                key={item.url} 
                                item={item} 
                            />
                        ))
                ) : loading === 'succeeded' && (
                    <p>No news articles available for this category.</p>
                )}
            </div>
        </div>
    );
}

export default TopicBasedNews;
