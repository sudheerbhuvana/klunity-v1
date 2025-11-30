import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authAPI.forgotPassword(email);
            logger.info('ForgotPasswordPage', 'OTP requested', { email });
            setStep('otp');
            toast.success('OTP sent to your email');
        } catch (error: any) {
            logger.error('ForgotPasswordPage', 'Failed to request OTP', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await authAPI.resetPassword(email, otp, newPassword);
            logger.info('ForgotPasswordPage', 'Password reset successful');
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error: any) {
            logger.error('ForgotPasswordPage', 'Password reset failed', error);
            toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] via-[#6366F1] to-[#2F81F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link to="/login" className="inline-flex items-center text-white font-bold mb-8 hover:underline">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Login
                </Link>

                <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
                        </h1>
                        <p className="text-gray-600">
                            {step === 'email'
                                ? 'Enter your email to receive a verification code'
                                : `Enter the code sent to ${email}`}
                        </p>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="24000xxxx@kluniversity.in"
                                        className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all"
                            >
                                {loading ? 'Sending Code...' : 'Send Verification Code'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Verification Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="pl-12 h-14 border-3 border-black rounded-xl text-base tracking-widest font-mono"
                                        required
                                        maxLength={6}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all"
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-sm font-bold text-gray-500 hover:text-black"
                            >
                                Change Email
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
