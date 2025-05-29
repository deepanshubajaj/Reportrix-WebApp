import React, { useEffect } from 'react';
import './general-news-page.style.scss';
import { useSelector, useDispatch } from 'react-redux';
import NewsBox from '../../components/news-box/news-box.component';
import { fetchCateredNews } from '../../features/cateredNewsSlice';

function GeneralNews() {
    const dispatch = useDispatch();

    // Fetch state from Redux store
    const { news, loading, error } = useSelector((state) => state.cateredNews);
    const newsContent = news?.['General'] || [];

    // Trigger fetch on mount if not already loaded
    useEffect(() => {
        if (!news?.['General']) {
            dispatch(fetchCateredNews('General'));
        }
    }, [dispatch, news]);

    return (
        <div className='general-news-page-container'>
            <div className="general-news-container">
                <h1 className='title'>General News</h1>

                {loading === 'loading' && <p>Loading general news...</p>}
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
                    <p>No news articles available at the moment.</p>
                )}
            </div>
        </div>
    );
}

export default GeneralNews;
