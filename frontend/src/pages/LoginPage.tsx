import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const validateForm = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            logger.warn('LoginPage', 'Form validation failed');
            return;
        }

        setLoading(true);
        logger.info('LoginPage', 'Attempting login', { email: formData.email });

        try {
            await login(formData.email, formData.password);
            logger.info('LoginPage', 'Login successful');
            navigate('/feed');
        } catch (err: any) {
            logger.error('LoginPage', 'Login failed', err);

            if (err.response?.data?.requiresVerification) {
                navigate('/verify-email', {
                    state: { email: err.response.data.email }
                });
                return;
            }

            setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] via-[#6366F1] to-[#2F81F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
                        <img src="/images/klunitylogo.png" alt="KL Unity Logo" className="h-24 w-auto object-contain" />
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
                    <p className="text-white/90">Login to KL Unity</p>
                </div>

                <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="24000xxxx"
                                    className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                                    id="remember"
                                />
                                <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm font-bold text-[#6366F1] hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/signup" className="font-bold text-[#6366F1] hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
