'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestGuard from '@/components/auth/GuestGuard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';  //redux

import { login } from '@/redux/auth/authThunk'; // redux
import './admin-login.css';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    // Validation state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // UI state
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const [show2FA, setShow2FA] = useState(false);
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(120);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (show2FA && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [show2FA, countdown]);

    const showNotif = (msg: string, type: 'success' | 'error') => {
        setNotification({ show: true, message: msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        let valid = true;
        setEmailError('');
        setPasswordError('');

        if (!email.trim()) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email.');
            valid = false;
        }
        if (!password) {
            setPasswordError('Password is required.');
            valid = false;
        }

        if (valid) {
            dispatch(login({ email, password, isAdmin: true }))
                .unwrap()
                .then((res) => {
                    if (res && res.user && res.user.role === 'admin') {
                        showNotif('Login successful! Redirecting...', 'success');
                        setTimeout(() => {
                            router.replace('/admin/dashboard');
                        }, 1200);
                    } else {
                        showNotif('Unauthorized access.', 'error');
                    }
                })
                .catch((err) => {
                    showNotif(err || 'Invalid credentials. Please try again.', 'error');
                });
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const formatCountdown = () => {
        if (countdown <= 0) return 'Expired';
        const m = String(Math.floor(countdown / 60)).padStart(2, '0');
        const s = String(countdown % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const verify2FA = () => {
        const code = otpCode.join('');
        if (code.length < 6) {
            showNotif('Please enter all 6 digits.', 'error');
            return;
        }
        showNotif('Verifying code...', 'success');
        setTimeout(() => {
            setShow2FA(false);
            showNotif('2FA verified! Redirecting...', 'success');
            setTimeout(() => { router.replace('/admin/dashboard'); }, 1200);
        }, 1200);
    };

    return (
        <GuestGuard>
            <div className="admin-auth-container">
                <div className="login-card">
                    <div className="card-header">
                        <div className="security-badge">
                            <i className="fas fa-shield-halved"></i>
                            Secure Admin Portal
                        </div>
                        <div className="logo-wrap">
                            <div className="logo-icon"><i className="fas fa-stethoscope"></i></div>
                            <div className="logo-text">Zy<span>doc</span></div>
                        </div>
                        <div className="header-title">Admin Control Center</div>
                        <div className="header-sub">Authorized personnel only. All access is logged and monitored.</div>
                    </div>

                    <div className="card-body">
                        <div className="alert-warning">
                            <i className="fas fa-triangle-exclamation"></i>
                            <div>This is a restricted admin area. Unauthorized access attempts are reported to security.</div>
                        </div>

                        <form onSubmit={handleLogin} noValidate>
                            <div className="form-group">
                                <label htmlFor="email">Admin Email Address</label>
                                <div className="input-wrap">
                                    <i className="fas fa-envelope input-icon"></i>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="admin@zydoc.com"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={emailError ? 'error' : ''}
                                    />
                                </div>
                                <div className={`error-msg ${emailError ? 'show' : ''}`}>
                                    <i className="fas fa-circle-exclamation"></i>
                                    <span>{emailError}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrap">
                                    <i className="fas fa-lock input-icon"></i>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={passwordError ? 'error' : ''}
                                    />
                                    <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                                    </button>
                                </div>
                                <div className={`error-msg ${passwordError ? 'show' : ''}`}>
                                    <i className="fas fa-circle-exclamation"></i>
                                    <span>{passwordError}</span>
                                </div>
                            </div>

                            <div className="form-row">
                                <label className="checkbox-label">
                                    <input type="checkbox" id="remember" />
                                    Remember this device
                                </label>
                                <Link href="#" className="forgot-link">Forgot Password?</Link>
                            </div>

                            <button type="submit" className={`btn-login ${isLoading ? 'loading' : ''}`}>
                                {isLoading ? (
                                    <><i className="fas fa-circle-notch fa-spin"></i> Signing in...</>
                                ) : (
                                    <><i className="fas fa-right-to-bracket"></i> Sign In to Admin</>
                                )}
                            </button>
                        </form>

                        <div className="divider"><span>or use</span></div>

                        <button className="btn-2fa" onClick={() => setShow2FA(true)}>
                            <i className="fas fa-mobile-screen"></i>
                            Sign in with Two-Factor Authentication
                        </button>
                    </div>

                    <div className="card-footer">
                        &copy; 2025 Zydoc Admin Portal &nbsp;|&nbsp;
                        <Link href="#">Privacy Policy</Link> &nbsp;|&nbsp;
                        <Link href="#">Terms of Use</Link>
                    </div>
                </div>

                {/* 2FA Modal */}
                <div className={`modal-overlay ${show2FA ? 'show' : ''}`}>
                    <div className="modal">
                        <div className="modal-icon"><i className="fas fa-mobile-screen"></i></div>
                        <h3>Two-Factor Authentication</h3>
                        <p>Enter the 6-digit code from your authenticator app or sent to your registered mobile number.</p>
                        <div className="otp-inputs">
                            {otpCode.map((digit, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    className="otp-input"
                                    maxLength={1}
                                    inputMode="numeric"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    ref={(el) => { otpRefs.current[idx] = el; }}
                                />
                            ))}
                        </div>
                        <div className="otp-timer">Code expires in <span>{formatCountdown()}</span></div>
                        <button className="btn-verify" onClick={verify2FA}>Verify & Sign In</button>
                        <button className="btn-cancel-modal" onClick={() => setShow2FA(false)}>Cancel</button>
                    </div>
                </div>

                {/* Notification */}
                <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`}>
                    <i className={`fas ${notification.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'} notif-icon`}></i>
                    <span>{notification.message}</span>
                </div>
            </div>
        </GuestGuard>
    );
}
