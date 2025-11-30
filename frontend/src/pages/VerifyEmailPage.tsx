import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { toast } from "sonner"

export function VerifyEmailPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [otp, setOtp] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [email, setEmail] = useState("")

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email)
        } else {
            // If no email in state, redirect to login
            navigate('/login')
        }
    }, [location, navigate])

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP")
            return
        }

        setIsVerifying(true)
        try {
            await authAPI.verifyEmail(email, otp)
            toast.success("Email verified successfully!")
            navigate('/login')
        } catch (error: any) {
            logger.error('VerifyEmailPage', 'OTP verification failed', error)
            toast.error(error.response?.data?.message || "Invalid OTP")
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            await authAPI.resendOTP(email)
            toast.success("OTP resent successfully!")
        } catch (error: any) {
            toast.error("Failed to resend OTP")
        }
    }

    if (!email) return null

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
                        <span className="font-bold text-black">{email}</span>
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
