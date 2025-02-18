import React, { useState } from 'react';
import axios from 'axios';

const ManufacturerRegistration = () => {
    const [email, setEmail] = useState('');

    const handleVerifyEmail = () => {
        // Store email in localStorage before redirect
        localStorage.setItem('manufacturerEmail', email);

        // Construct the UiPath OAuth URL with required parameters
        const uiPathOAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        const params = {
            client_id: '1018027259754-cc60lhs363egheqrgpqo6pi0dsut2hp8.apps.googleusercontent.com',
            redirect_uri: 'https://cloud.uipath.com/redirect',
            response_type: 'code',
            scope: 'https://mail.google.com/',
            access_type: 'offline',
            prompt: 'consent',
            service: 'lso',
            o2v: '2',
            flowName: 'GeneralOAuthFlow'
        };

        // Add query parameters to URL
        uiPathOAuthUrl.search = new URLSearchParams(params).toString();

        // Redirect to UiPath OAuth page
        window.location.href = uiPathOAuthUrl.toString();
    };

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
            <button 
                onClick={handleVerifyEmail}
                disabled={!email}
            >
                Verify with UiPath
            </button>
        </div>
    );
};

export default ManufacturerRegistration; 