import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Get the stored email
        const email = localStorage.getItem('manufacturerEmail');
        
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Here you can make an API call to your backend to store the verification status
            // for this manufacturer's email if needed
            
            // Clear the stored email
            localStorage.removeItem('manufacturerEmail');
            
            // Redirect back to registration completion
            navigate('/manufacturer/registration/complete');
        } else {
            // Handle error case
            navigate('/manufacturer/registration/error');
        }
    }, [navigate]);

    return (
        <div>
            Processing verification...
        </div>
    );
};

export default OAuthCallback; 