import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialStateValue = {
    news: [],
    loading: 'idle',
    error: null,
};

const fetchNews = createAsyncThunk('news/fetchNews', async () => {
    try {
        const apiKey = process.env.REACT_APP_NEWS_API_KEY;
        const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=${apiKey}`)}`);
        const data = JSON.parse(response.data.contents);
        return data.articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error('Failed to fetch news');
    }
});

const newsSlice = createSlice({
    name: 'news',
    initialState: initialStateValue,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNews.pending, (state) => {
                state.loading = 'loading';
            })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.news = action.payload;
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message;
            });
    },
});

export default newsSlice.reducer;

export { fetchNews };
