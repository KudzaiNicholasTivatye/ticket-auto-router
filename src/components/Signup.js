import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Signup.css'; // import CSS

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ firstName: '', lastName: '', email: '', password: '' });
  };

  // Supabase Sign Up
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Signup successful! Check your email for confirmation.');
    }
    setLoading(false);
  };

  // Supabase Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Logged in!');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Sliding panel */}
        <div className={`auth-panel ${isSignUp ? 'sign-up-panel' : 'sign-in-panel'}`}>
          <div className="auth-panel-content">
            <h2>{isSignUp ? 'Already Signed up?' : 'New to Ticket-Auto Router?'}</h2>
            <p>
              {isSignUp
                ? 'Log in to your account so you can continue building and editing your onboarding flows.'
                : 'Sign up to create your account and start building amazing onboarding experiences.'}
            </p>
            <button onClick={switchMode}>
              {isSignUp ? 'LOG IN' : 'SIGN UP'}
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="auth-forms">
          {/* Sign Up Form */}
          <div className={`form-container ${isSignUp ? 'active' : 'hidden'}`}>
            <h1>Ticket-Auto Router</h1>
            <h2>Sign Up for an Account</h2>
            <p>Let's get you all set up so you can start creating your first onboarding experience.</p>
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="name-fields">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Signing up...' : 'SIGN UP'}
              </button>
            </form>
          </div>

          {/* Login Form */}
          <div className={`form-container ${!isSignUp ? 'active' : 'hidden'}`}>
            <h1>Ticket-Auto Router</h1>
            <h2>Welcome Back!</h2>
            <p>Please sign in to your account to continue building amazing onboarding experiences.</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'LOG IN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
