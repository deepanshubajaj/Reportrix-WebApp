import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialStateValue = {
    news: {},
    loading: 'idle',
    error: null,
    lastFetchTime: {},
};

// Utility function for exponential backoff
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchCateredNews = createAsyncThunk('news/fetchCateredNews', async (searchString, { getState, rejectWithValue }) => {
    try {
        const apiKey = process.env.REACT_APP_NEWS_API_KEY;
        // Map our category names to NewsAPI's expected format
        const categoryMap = {
            'general': 'general',
            'business': 'business',
            'entertainment': 'entertainment',
            'health': 'health',
            'science': 'science',
            'sports': 'sports',
            'technology': 'technology'
        };
        
        // Get the lowercase category for API call
        const apiCategory = categoryMap[searchString.toLowerCase()];
        if (!apiCategory) {
            console.error(`Invalid category: ${searchString}`);
            return rejectWithValue(`Invalid category: ${searchString}`);
        }
        
        // Store using the original casing
        const storeCategory = searchString.charAt(0).toUpperCase() + searchString.slice(1);
        
        // Check if we already have cached news for this category
        const state = getState();
        const cachedNews = state.cateredNews.news[searchString];
        const lastFetch = state.cateredNews.lastFetchTime[searchString];
        const now = Date.now();
        
        // If we have cached news and it's less than 30 minutes old, use it
        if (cachedNews && lastFetch && (now - lastFetch < 30 * 60 * 1000)) {
            console.log(`Using cached news for ${searchString} (cache age: ${Math.round((now - lastFetch)/1000)}s)`);
            return { [searchString]: cachedNews, lastFetchTime: { [searchString]: lastFetch } };
        }
        
        console.log(`Fetching news for category: ${searchString} (API category: ${apiCategory})`);
        
        // Implement exponential backoff for rate limiting
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
            try {
                // Add delay between requests to avoid rate limiting
                const delayTime = Math.min(1000 * Math.pow(2, retries), 8000); // Max 8 second delay
                await wait(delayTime);
                
                const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${apiCategory}&apiKey=${apiKey}`);
                
                if (!response.data) {
                    throw new Error('No data in response');
                }
                
                if (!response.data.articles) {
                    throw new Error(`No articles found for category: ${searchString}`);
                }
                
                console.log(`Successfully fetched ${response.data.articles.length} articles for ${searchString}`);
                
                // Return the news with the original category name and fetch time
                return {
                    [searchString]: response.data.articles.slice(0, 60),
                    lastFetchTime: { [searchString]: now }
                };
            } catch (error) {
                retries++;
                
                if (error.response?.status === 429) {
                    console.log(`Rate limit hit (attempt ${retries}/${maxRetries}), waiting before retry...`);
                    
                    // If we have cached data, return it while we're rate limited
                    if (cachedNews) {
                        console.log(`Returning cached news for ${searchString} while rate limited`);
                        return {
                            [searchString]: cachedNews,
                            lastFetchTime: { [searchString]: lastFetch || now }
                        };
                    }
                    
                    // If we're out of retries, throw the error
                    if (retries === maxRetries) {
                        return rejectWithValue('Rate limit exceeded. Please try again later.');
                    }
                    
                    // Otherwise continue to next retry
                    continue;
                }
                
                // For other errors, throw immediately
                throw error;
            }
        }
        
        throw new Error('Maximum retries exceeded');
    } catch (error) {
        console.error(`Error fetching news for category ${searchString}:`, {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        return rejectWithValue(error.message);
    }
});

const cateredNewsSlice = createSlice({
    name: 'cateredNews',
    initialState: initialStateValue,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchCateredNews.pending, (state) => {
            state.loading = 'loading';
        })
        .addCase(fetchCateredNews.fulfilled, (state, action) => {
            state.loading = 'succeeded';
            state.news = { ...state.news, ...action.payload };
            if (action.payload.lastFetchTime) {
                state.lastFetchTime = { ...state.lastFetchTime, ...action.payload.lastFetchTime };
            }
        })
        .addCase(fetchCateredNews.rejected, (state, action) => {
            state.loading = 'failed';
            state.error = action.payload || action.error.message;
        });
    },
});

export default cateredNewsSlice.reducer;

export { fetchCateredNews };
