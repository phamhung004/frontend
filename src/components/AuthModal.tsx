import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { signIn, signUp, resetPassword } = useAuth();
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form states
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await signIn({ 
        email: loginEmail, 
        password: loginPassword 
      });
      
      if (error) {
        setError(error);
      } else {
        setSuccess('Login successful!');
        setTimeout(() => {
          onClose();
          // Reset form
          setLoginEmail('');
          setLoginPassword('');
          setError(null);
          setSuccess(null);
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!registerFirstName || !registerLastName || !registerEmail || !registerPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await signUp({
        email: registerEmail,
        password: registerPassword,
        firstName: registerFirstName,
        lastName: registerLastName,
      });
      
      if (error) {
        setError(error);
      } else {
        setSuccess('Registration successful! Please check your email to verify your account, then login.');
        setTimeout(() => {
          // Chuyển sang tab login sau khi đăng ký thành công
          setActiveTab('login');
          // Reset form
          setRegisterFirstName('');
          setRegisterLastName('');
          setRegisterEmail('');
          setRegisterPassword('');
          setAgreeToTerms(false);
          setError(null);
          setSuccess(null);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!resetEmail) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setError(error);
      } else {
        setSuccess('Password reset email sent! Please check your inbox.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail('');
          setError(null);
          setSuccess(null);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded w-full max-w-[482px] mx-4 md:mx-0 md:w-[482px] max-h-[90vh] overflow-y-auto">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-[200px] md:h-[253px] bg-[#FFF5F2] overflow-hidden rounded-t">
          {/* Illustration for Register Tab */}
          {activeTab === 'register' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 400 250" fill="none" className="w-full h-full">
                {/* Phone/Device */}
                <rect x="80" y="40" width="140" height="180" rx="10" fill="white" stroke="#9F86D9" strokeWidth="3"/>
                <rect x="95" y="55" width="110" height="150" rx="5" fill="#F5F5FF"/>
                
                {/* Profile circle on phone */}
                <circle cx="150" cy="90" r="20" fill="#9F86D9" opacity="0.3"/>
                <circle cx="145" cy="87" r="8" fill="#748CE6"/>
                <path d="M135 100 Q150 95 165 100" stroke="#748CE6" strokeWidth="3" fill="none"/>
                
                {/* Password bars on phone */}
                <rect x="110" y="125" width="80" height="12" rx="6" fill="#F992C7"/>
                <circle cx="115" cy="131" r="3" fill="white"/>
                <circle cx="125" cy="131" r="3" fill="white"/>
                <circle cx="135" cy="131" r="3" fill="white"/>
                <circle cx="145" cy="131" r="3" fill="white"/>
                <circle cx="155" cy="131" r="3" fill="white"/>
                
                <rect x="110" y="145" width="80" height="12" rx="6" fill="#F992C7"/>
                <circle cx="115" cy="151" r="3" fill="white"/>
                <circle cx="125" cy="151" r="3" fill="white"/>
                <circle cx="135" cy="151" r="3" fill="white"/>
                
                {/* Checkboxes on phone */}
                <rect x="110" y="170" width="15" height="15" rx="2" fill="white" stroke="#9F86D9" strokeWidth="2"/>
                <rect x="135" y="170" width="15" height="15" rx="2" fill="white" stroke="#9F86D9" strokeWidth="2"/>
                <rect x="160" y="170" width="15" height="15" rx="2" fill="white" stroke="#9F86D9" strokeWidth="2"/>
                
                {/* Person */}
                <ellipse cx="280" cy="100" rx="25" ry="28" fill="#9F86D9"/>
                <circle cx="280" cy="95" r="18" fill="#FCAD88"/>
                <rect x="270" y="90" width="8" height="3" fill="#2F304C"/>
                <rect x="282" y="90" width="8" height="3" fill="#2F304C"/>
                <ellipse cx="280" cy="105" rx="3" ry="2" fill="#F992C7"/>
                
                {/* Person body */}
                <rect x="255" y="125" width="50" height="60" rx="25" fill="#EDA62A"/>
                <rect x="250" y="140" width="15" height="45" rx="7" fill="#FCAD88"/>
                <rect x="285" y="140" width="15" height="45" rx="7" fill="#FCAD88"/>
                
                {/* Pants */}
                <rect x="260" y="175" width="18" height="35" rx="5" fill="#2F304C"/>
                <rect x="272" y="175" width="18" height="35" rx="5" fill="#2F304C"/>
                
                {/* Shoes */}
                <ellipse cx="269" cy="210" rx="10" ry="5" fill="#646667"/>
                <ellipse cx="281" cy="210" rx="10" ry="5" fill="#646667"/>
                
                {/* Plant */}
                <rect x="20" y="165" width="20" height="30" rx="3" fill="#0ACF83"/>
                <ellipse cx="30" cy="155" rx="15" ry="20" fill="#0ACF83"/>
                <circle cx="25" cy="150" r="8" fill="#0ACF83"/>
                <circle cx="35" cy="148" r="8" fill="#0ACF83"/>
                
                {/* Pot */}
                <path d="M22 165 L38 165 L36 180 L24 180 Z" fill="#FCAD88"/>
                
                {/* Lock icon */}
                <rect x="20" y="90" width="25" height="30" rx="3" fill="#DBE2E5"/>
                <rect x="27" y="80" width="11" height="15" rx="5" fill="none" stroke="#646667" strokeWidth="2"/>
                <circle cx="32.5" cy="107" r="3" fill="#646667"/>
                
                {/* Arrow */}
                <path d="M15 45 Q25 35 35 45" stroke="#646667" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M32 42 L35 45 L32 48" stroke="#646667" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          
          {/* Illustration for Login Tab */}
          {activeTab === 'login' && (
            <div className="absolute inset-0 flex items-center justify-center pt-8">
              <svg viewBox="0 0 300 200" fill="none" className="w-full h-full">
                {/* Simple baby illustration */}
                <circle cx="150" cy="70" r="35" fill="#E6E6FA"/>
                <circle cx="140" cy="65" r="4" fill="#9F86D9"/>
                <circle cx="160" cy="65" r="4" fill="#9F86D9"/>
                <path d="M145 75 Q150 78 155 75" stroke="#F992C7" strokeWidth="2" fill="none"/>
                
                {/* Baby body */}
                <ellipse cx="150" cy="130" rx="40" ry="50" fill="#E6E6FA"/>
                <circle cx="145" cy="120" r="6" fill="#F992C7"/>
                <circle cx="155" cy="120" r="6" fill="#F992C7"/>
                
                {/* Decorative dots */}
                <circle cx="100" cy="100" r="3" fill="#9F86D9" opacity="0.3"/>
                <circle cx="200" cy="120" r="3" fill="#F992C7" opacity="0.3"/>
                <circle cx="120" cy="150" r="2" fill="#9F86D9" opacity="0.3"/>
              </svg>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 md:top-6 right-4 md:right-6 w-[24px] md:w-[31px] h-[24px] md:h-[31px] z-10 hover:opacity-70 transition-opacity"
        >
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="#1C1D1D" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative pt-[240px] md:pt-[298px] px-6 md:px-[33px] pb-6 md:pb-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          {/* Forgot Password View */}
          {showForgotPassword ? (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-[#1C1D1D]" style={{ fontFamily: 'DM Sans' }}>
                Reset Password
              </h2>
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                  <input
                    type="email"
                    placeholder="Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full h-full text-sm text-[#1C1D1D] outline-none"
                    style={{ fontFamily: 'DM Sans' }}
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-[51px] bg-[#9F86D9] rounded flex items-center justify-center text-white font-bold text-base hover:bg-[#8e75c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span style={{ fontFamily: 'DM Sans', lineHeight: '1.75em' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-[#9F86D9] hover:underline"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  Back to Login
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Tabs and Form */}
              <div className="flex flex-col gap-6">
                {/* Tab Navigation */}
                <div className="flex flex-col gap-[25px]">
                  <div className="flex gap-[29px]">
                    <button
                      onClick={() => {
                        setActiveTab('login');
                        setError(null);
                        setSuccess(null);
                      }}
                      className={`text-2xl font-bold transition-colors ${
                        activeTab === 'login' ? 'text-[#1C1D1D]' : 'text-[#BEC0C1]'
                      }`}
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('register');
                        setError(null);
                        setSuccess(null);
                      }}
                      className={`text-2xl font-bold transition-colors ${
                        activeTab === 'register' ? 'text-[#1C1D1D]' : 'text-[#BEC0C1]'
                      }`}
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      Register
                    </button>
                  </div>

                  {/* Login Form */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="flex flex-col gap-[15px]">
                      <div className="flex flex-col gap-3">
                        {/* Username/Email Input */}
                        <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                          <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full h-full text-sm text-[#1C1D1D] outline-none"
                            style={{ fontFamily: 'DM Sans' }}
                            disabled={loading}
                            required
                          />
                        </div>

                        {/* Password Input */}
                        <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                          <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full h-full text-sm text-[#646667] outline-none placeholder:text-[#646667]"
                            style={{ fontFamily: 'DM Sans' }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      {/* Forgot Password */}
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-[#9F86D9] hover:underline text-left"
                        style={{ fontFamily: 'DM Sans', lineHeight: '1.5em' }}
                      >
                        Forgot your password?
                      </button>
                    </form>
                  )}

                  {/* Register Form */}
                  {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="flex flex-col gap-[15px]">
                      <div className="flex flex-col gap-3">
                        {/* First Name Input */}
                        <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={registerFirstName}
                            onChange={(e) => setRegisterFirstName(e.target.value)}
                            className="w-full h-full text-sm text-[#1C1D1D] outline-none"
                            style={{ fontFamily: 'DM Sans' }}
                            disabled={loading}
                            required
                          />
                        </div>

                        {/* Last Name Input */}
                        <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={registerLastName}
                            onChange={(e) => setRegisterLastName(e.target.value)}
                            className="w-full h-full text-sm text-[#646667] outline-none placeholder:text-[#646667]"
                            style={{ fontFamily: 'DM Sans' }}
                            disabled={loading}
                            required
                          />
                        </div>

                        {/* Email Input */}
                        <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                          <input
                            type="email"
                            placeholder="Email"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="w-full h-full text-sm text-[#646667] outline-none placeholder:text-[#646667]"
                            style={{ fontFamily: 'DM Sans' }}
                            disabled={loading}
                            required
                          />
                        </div>

                        {/* Password Input */}
                        <div className="w-full h-[51px] border border-[#DBE2E5] rounded px-[18px] py-[18px] bg-white">
                          <input
                            type="password"
                            placeholder="Password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="w-full h-full text-sm text-[#646667] outline-none placeholder:text-[#646667]"
                            style={{ fontFamily: 'DM Sans' }}
                            disabled={loading}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex gap-3">
                        <div className="w-5 h-5 border border-[#646667] rounded flex items-center justify-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-full h-full cursor-pointer"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            disabled={loading}
                          />
                        </div>
                        <p className="text-sm text-[#1C1D1D]" style={{ fontFamily: 'DM Sans', lineHeight: '1.5em' }}>
                          Join for Free and start earning points today. Benefits include 15% off your first purchase,
                        </p>
                      </div>
                    </form>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (activeTab === 'login') {
                      handleLogin(e);
                    } else {
                      handleRegister(e);
                    }
                  }}
                  disabled={loading}
                  className="w-full h-[51px] bg-[#9F86D9] rounded flex items-center justify-center text-white font-bold text-base hover:bg-[#8e75c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span style={{ fontFamily: 'DM Sans', lineHeight: '1.75em' }}>
                    {loading ? 'Processing...' : (activeTab === 'login' ? 'Login' : 'Register')}
                  </span>
                </button>
              </div>

              {/* Privacy & Terms */}
              <p className="text-sm text-[#1C1D1D] opacity-80 mt-8 text-center" style={{ fontFamily: 'DM Sans', lineHeight: '1.5em' }}>
                Privacy & Terms
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
