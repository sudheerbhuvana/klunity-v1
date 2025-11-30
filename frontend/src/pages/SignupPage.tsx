import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, User, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { logger } from "@/lib/logger"
import { authAPI } from "@/lib/api"
import { toast } from "sonner"

export function SignupPage() {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        role: "student"
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    // OTP State
    const [showOTP, setShowOTP] = useState(false)
    const [otp, setOtp] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        logger.componentMount('SignupPage')
        return () => logger.componentUnmount('SignupPage')
    }, [])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username is required"
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters"
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores"
        }

        if (!formData.email) {
            newErrors.email = "Email is required"
        } else if (!formData.email.endsWith('@kluniversity.in')) {
            newErrors.email = "Must be a valid @kluniversity.in email"
        } else {
            const prefix = formData.email.split('@')[0];
            if (formData.role === 'student') {
                if (!/^\d{10}$/.test(prefix)) {
                    newErrors.email = "Student ID must be exactly 10 digits"
                }
            } else {
                if (!prefix) {
                    newErrors.email = "Faculty ID/Email prefix is required"
                }
            }
        }

        if (!formData.department) {
            newErrors.department = "Department is required"
        }

        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        if (!agreeToTerms) {
            newErrors.terms = "You must agree to the terms and conditions"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        logger.userAction('SignupPage', 'Signup form submitted', {
            name: formData.name,
            email: formData.email
        })

        if (validateForm()) {
            setIsLoading(true)
            try {
                await authAPI.register({
                    username: formData.username,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    department: formData.department,
                    role: formData.role
                })
                logger.info('SignupPage', 'Registration successful, showing OTP')
                toast.success("Registration successful! Please check your email for the OTP.")
                setShowOTP(true)
            } catch (error: any) {
                logger.error('SignupPage', 'Registration failed', error)
                toast.error(error.response?.data?.message || "Registration failed")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP")
            return
        }

        setIsVerifying(true)
        try {
            await authAPI.verifyEmail(formData.email, otp)
            toast.success("Email verified successfully!")
            navigate('/login')
        } catch (error: any) {
            logger.error('SignupPage', 'OTP verification failed', error)
            toast.error(error.response?.data?.message || "Invalid OTP")
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            await authAPI.resendOTP(formData.email)
            toast.success("OTP resent successfully!")
        } catch (error: any) {
            toast.error("Failed to resend OTP")
        }
    }



    if (showOTP) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFC224] via-[#FF6B7A] to-[#6366F1] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center mb-8">
                        <div className="inline-block w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Check your email</h1>
                        <p className="text-gray-600">
                            We sent a verification code to <br />
                            <span className="font-bold text-black">{formData.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Verification Code</label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="h-14 text-center text-2xl tracking-widest border-3 border-black rounded-xl font-mono"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all"
                        >
                            {isVerifying ? "Verifying..." : "Verify Email"}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-sm font-bold text-[#6366F1] hover:underline"
                            >
                                Resend Code
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFC224] via-[#FF6B7A] to-[#6366F1] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-6">
                        <img src="/images/klunitylogo.png" alt="KL Unity Logo" className="h-24 w-auto object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Join KL Unity!</h1>
                    <p className="text-white/90">Create your account to get started</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <form onSubmit={handleSubmit} className="space-y-5">


                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Full Name as per University</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="John Doe"
                                    className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Prefix Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">University ID / Email Prefix</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={formData.email.split('@')[0]}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // If student, only allow digits and max 10 chars
                                        if (formData.role === 'student') {
                                            if (/^\d{0,10}$/.test(val)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    email: val + '@kluniversity.in',
                                                    username: val
                                                }));
                                                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                                if (errors.username) setErrors(prev => ({ ...prev, username: "" }));
                                            }
                                        } else {
                                            // Faculty can type anything
                                            setFormData(prev => ({
                                                ...prev,
                                                email: val + '@kluniversity.in',
                                                username: val
                                            }));
                                            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                            if (errors.username) setErrors(prev => ({ ...prev, username: "" }));
                                        }
                                    }}
                                    placeholder={formData.role === 'student' ? "24000xxxx" : "faculty.id"}
                                    className="pl-12 pr-36 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                                <div className="absolute right-4 text-gray-500 font-bold pointer-events-none bg-white pl-2">
                                    @kluniversity.in
                                </div>
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Faculty Checkbox */}
                        <div
                            className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-black transition-colors cursor-pointer"
                            onClick={(e) => {
                                // Prevent double toggle if clicking checkbox or label directly
                                if (e.target !== e.currentTarget) return;

                                const newRole = formData.role === 'faculty' ? 'student' : 'faculty';
                                const currentPrefix = formData.email.split('@')[0];
                                if (newRole === 'student' && !/^\d{0,10}$/.test(currentPrefix)) {
                                    handleChange('email', '@kluniversity.in');
                                }
                                handleChange('role', newRole);
                            }}
                        >
                            <Checkbox
                                checked={formData.role === 'faculty'}
                                onCheckedChange={(checked) => {
                                    const newRole = checked ? 'faculty' : 'student';
                                    const currentPrefix = formData.email.split('@')[0];
                                    if (newRole === 'student' && !/^\d{0,10}$/.test(currentPrefix)) {
                                        handleChange('email', '@kluniversity.in');
                                    }
                                    handleChange('role', newRole);
                                }}
                                id="faculty"
                                className="w-5 h-5 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                                disabled={isLoading}
                            />
                            <label htmlFor="faculty" className="text-base font-bold cursor-pointer flex-1">
                                I am a Faculty Member
                            </label>
                        </div>

                        {/* Department Dropdown */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                className="w-full h-14 pl-4 pr-10 border-3 border-black rounded-xl text-base bg-white appearance-none cursor-pointer"
                                disabled={isLoading}
                            >
                                <option value="">Select Department</option>
                                <optgroup label="B.Tech">
                                    <option value="B.Tech AI&DS">B.Tech AI&DS</option>
                                    <option value="B.Tech CS&IT">B.Tech CS&IT</option>
                                    <option value="B.Tech ECS">B.Tech ECS</option>
                                    <option value="B.Tech IOT">B.Tech IOT</option>
                                    <option value="B.Tech ECE">B.Tech ECE</option>
                                    <option value="B.Tech CSE - 1">B.Tech CSE - 1</option>
                                    <option value="B.Tech CSE - 2">B.Tech CSE - 2</option>
                                    <option value="B.Tech CSE - 3">B.Tech CSE - 3</option>
                                    <option value="B.Tech CSE - 4">B.Tech CSE - 4</option>
                                    <option value="B.Tech CSE - Regular">B.Tech CSE - Regular</option>
                                    <option value="B.Tech BT">B.Tech BT</option>
                                    <option value="B.Tech CE">B.Tech CE</option>
                                    <option value="B.Tech EEE">B.Tech EEE</option>
                                    <option value="B.Tech ME">B.Tech ME</option>
                                    <option value="B.Tech HTE">B.Tech HTE</option>
                                    <option value="B.Tech HTI">B.Tech HTI</option>
                                    <option value="B.Tech HTR">B.Tech HTR</option>
                                </optgroup>
                                <optgroup label="B.Sc">
                                    <option value="B.Sc - VC">B.Sc - VC</option>
                                    <option value="B.Sc (Animation & Gaming)">B.Sc (Animation & Gaming)</option>
                                    <option value="B.Sc (Hons.) Agriculture">B.Sc (Hons.) Agriculture</option>
                                </optgroup>
                                <optgroup label="M.Tech">
                                    <option value="M.Tech - EVT">M.Tech - EVT</option>
                                    <option value="M.Tech - PE & PS">M.Tech - PE & PS</option>
                                    <option value="M.Tech - CTM">M.Tech - CTM</option>
                                    <option value="M.Tech - Machine Design">M.Tech - Machine Design</option>
                                    <option value="M.Tech - SE">M.Tech - SE</option>
                                    <option value="M.Tech - Thermal Engineering">M.Tech - Thermal Engineering</option>
                                    <option value="M.Tech - CSE">M.Tech - CSE</option>
                                </optgroup>
                                <optgroup label="M.Sc">
                                    <option value="M.Sc Computational Mathematics">M.Sc Computational Mathematics</option>
                                    <option value="M.Sc Nano Science and Technology">M.Sc Nano Science and Technology</option>
                                    <option value="M.Sc Chemistry">M.Sc Chemistry</option>
                                    <option value="M.Sc Physics">M.Sc Physics</option>
                                    <option value="M.Sc - F&C">M.Sc - F&C</option>
                                </optgroup>
                                <optgroup label="Other Undergraduate">
                                    <option value="B.Com">B.Com</option>
                                    <option value="B.Com.(Hons)">B.Com.(Hons)</option>
                                    <option value="B.A">B.A</option>
                                    <option value="B.Arch">B.Arch</option>
                                    <option value="B.Pharmacy">B.Pharmacy</option>
                                    <option value="LLB">LLB</option>
                                    <option value="BBA">BBA</option>
                                    <option value="BBA- BA">BBA- BA</option>
                                    <option value="BBA-LLB">BBA-LLB</option>
                                    <option value="BCA">BCA</option>
                                </optgroup>
                                <optgroup label="Other Postgraduate">
                                    <option value="M.Pharmacy">M.Pharmacy</option>
                                    <option value="MA DH&LS">MA DH&LS</option>
                                    <option value="MA - English">MA - English</option>
                                    <option value="MBA">MBA</option>
                                    <option value="MCA">MCA</option>
                                    <option value="Pharma D">Pharma D</option>
                                </optgroup>
                            </select>
                            {errors.department && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.department}</p>
                            )}
                        </div>



                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
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

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div>
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    checked={agreeToTerms}
                                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                                    id="terms"
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                                <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-[#6366F1] hover:underline">
                                        Terms and Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="text-[#6366F1] hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.terms}</p>
                            )}
                        </div>


                        {/* Signup Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-[#6366F1] hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div >
        </div >
    )
}
