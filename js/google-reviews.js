// Google Reviews Fetcher - Free Custom Solution
// This script fetches reviews from Google Places API and displays them in your custom card style

class GoogleReviewsWidget {
    constructor(placeId, apiKey, containerId) {
        this.placeId = placeId;
        this.apiKey = apiKey;
        this.containerId = containerId;
        this.cacheKey = 'google_reviews_cache';
        this.cacheTimeKey = 'google_reviews_cache_time';
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }

    // Check if we have cached reviews that are still valid
    getCachedReviews() {
        const cached = localStorage.getItem(this.cacheKey);
        const cacheTime = localStorage.getItem(this.cacheTimeKey);
        
        if (cached && cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < this.cacheDuration) {
                return JSON.parse(cached);
            }
        }
        return null;
    }

    // Cache reviews for 24 hours
    cacheReviews(reviews) {
        localStorage.setItem(this.cacheKey, JSON.stringify(reviews));
        localStorage.setItem(this.cacheTimeKey, Date.now().toString());
    }

    // Fetch reviews from Google Places API
    async fetchReviews() {
        // Check cache first
        const cached = this.getCachedReviews();
        if (cached) {
            console.log('Using cached reviews');
            this.displayReviews(cached);
            return;
        }

        try {
            // Using CORS proxy to avoid CORS issues
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=reviews,rating,user_ratings_total&key=${this.apiKey}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            const data = await response.json();
            
            if (data.result && data.result.reviews) {
                const reviews = data.result.reviews.slice(0, 3); // Get top 3 reviews
                this.cacheReviews(reviews);
                this.displayReviews(reviews);
            } else {
                this.displayFallbackReviews();
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            this.displayFallbackReviews();
        }
    }

    // Display reviews in custom card style
    displayReviews(reviews) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const reviewsHTML = reviews.map(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const reviewText = review.text.length > 200 
                ? review.text.substring(0, 200) + '...' 
                : review.text;
            const authorName = review.author_name;

            return `
                <div style="background: white; padding: 35px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); position: relative; border-top: 4px solid #5cb85c;">
                    <div style="color: #ffa500; font-size: 20px; margin-bottom: 20px;">${stars}</div>
                    <p style="color: #333; font-size: 15px; line-height: 1.7; margin-bottom: 25px; font-style: italic;">"${reviewText}"</p>
                    <div style="border-top: 2px solid #f0f0f0; padding-top: 15px;">
                        <p style="font-weight: 700; color: #1e3a5f; margin: 0; font-size: 16px;">${authorName}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = reviewsHTML;
    }

    // Fallback to static reviews if API fails
    displayFallbackReviews() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="background: white; padding: 35px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); position: relative; border-top: 4px solid #5cb85c;">
                <div style="color: #ffa500; font-size: 20px; margin-bottom: 20px;">★★★★★</div>
                <p style="color: #333; font-size: 15px; line-height: 1.7; margin-bottom: 25px; font-style: italic;">"I can't say enough about this company. The owner and his crew are amazing. They transformed my lawn and did a wonderful landscaping job around my pool cage."</p>
                <div style="border-top: 2px solid #f0f0f0; padding-top: 15px;">
                    <p style="font-weight: 700; color: #1e3a5f; margin: 0; font-size: 16px;">Sarah M.</p>
                </div>
            </div>
            <div style="background: white; padding: 35px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); position: relative; border-top: 4px solid #5cb85c;">
                <div style="color: #ffa500; font-size: 20px; margin-bottom: 20px;">★★★★★</div>
                <p style="color: #333; font-size: 15px; line-height: 1.7; margin-bottom: 25px; font-style: italic;">"Super professional, loved the new design they put in for us. Would use again when we do our next landscape project. Highly recommend."</p>
                <div style="border-top: 2px solid #f0f0f0; padding-top: 15px;">
                    <p style="font-weight: 700; color: #1e3a5f; margin: 0; font-size: 16px;">John D.</p>
                </div>
            </div>
            <div style="background: white; padding: 35px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); position: relative; border-top: 4px solid #5cb85c;">
                <div style="color: #ffa500; font-size: 20px; margin-bottom: 20px;">★★★★★</div>
                <p style="color: #333; font-size: 15px; line-height: 1.7; margin-bottom: 25px; font-style: italic;">"Absolutely amazing job! Very professional team. I never have to worry about the job being done. Would 100% recommend them over anyone else in Citrus county!"</p>
                <div style="border-top: 2px solid #f0f0f0; padding-top: 15px;">
                    <p style="font-weight: 700; color: #1e3a5f; margin: 0; font-size: 16px;">Lisa W.</p>
                </div>
            </div>
        `;
    }

    // Initialize the widget
    init() {
        this.fetchReviews();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Place ID for Clipped to Perfection
    const PLACE_ID = 'ChIJLQTPv4IKbE4R21kXXqgrnaE';
    const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // Get from: https://console.cloud.google.com/
    
    const widget = new GoogleReviewsWidget(PLACE_ID, API_KEY, 'google-reviews-widget');
    widget.init();
});
