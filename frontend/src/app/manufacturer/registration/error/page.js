export default function RegistrationError() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
                <p>There was an error verifying your email. Please try again or contact support if the problem persists.</p>
            </div>
        </div>
    );
} 