import { useEffect, useRef } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { LogoMarquee } from "@/components/logo-marquee"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { Toaster } from "@/components/ui/sonner"
import { PortfolioSection } from "@/components/portfolio-section"
import { ExperienceSection } from "@/components/experience-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ArticlesSection } from "@/components/articles-section"
import { Footer } from "@/components/footer"
import { LoginPage } from "@/pages/LoginPage"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { VerifyEmailPage } from "@/pages/VerifyEmailPage"
import { SignupPage } from "@/pages/SignupPage"
import { FeedPage } from "@/pages/FeedPage"
import { CreateStoryPage } from "@/pages/CreateStoryPage"
import { StoryPage } from "@/pages/StoryPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { ExplorePage } from "@/pages/ExplorePage"
import { AboutPage } from "@/pages/AboutPage"
import { ContactPage } from "@/pages/ContactPage"
import { TermsPage } from "@/pages/TermsPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { MessagesPage } from "@/pages/MessagesPage"
import { AdminDashboardPage } from "@/pages/AdminDashboardPage"
import { logger } from "@/lib/logger"

function HomePage() {
    return (
        <>
            <Navigation />
            <HeroSection />
            <LogoMarquee />
            <ServicesSection />
            <AboutSection />
            <PortfolioSection />
            <ExperienceSection />
            <TestimonialsSection />
            <ArticlesSection />
            <Footer />
        </>
    )
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()

    if (loading) return <div>Loading...</div>

    if (!user) {
        return <Navigate to="/login" />
    }

    return <>{children}</>
}

// Public Route Component (redirects to feed if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()

    if (loading) return <div>Loading...</div>

    if (user) {
        return <Navigate to="/feed" />
    }

    return <>{children}</>
}

function App() {
    const renderCount = useRef(0)

    useEffect(() => {
        renderCount.current += 1
        logger.componentRender('App', renderCount.current)
    })

    useEffect(() => {
        logger.componentMount('App', {
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            timestamp: new Date().toISOString(),
        })

        logger.info('App', 'Application loaded with routing and authentication')

        return () => {
            logger.componentUnmount('App')
        }
    }, [])

    return (
        <AuthProvider>
            <BrowserRouter>
                <main className="min-h-screen bg-[#FFFFFF] font-sans antialiased">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <PublicRoute>
                                    <HomePage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <PublicRoute>
                                    <ForgotPasswordPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/verify-email"
                            element={
                                <PublicRoute>
                                    <VerifyEmailPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicRoute>
                                    <SignupPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/feed"
                            element={
                                <ProtectedRoute>
                                    <FeedPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create"
                            element={
                                <ProtectedRoute>
                                    <CreateStoryPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/story/:id"
                            element={
                                <ProtectedRoute>
                                    <StoryPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/explore"
                            element={
                                <ProtectedRoute>
                                    <ExplorePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/:username"
                            element={
                                <ProfilePage />
                            }
                        />
                        <Route
                            path="/messages"
                            element={
                                <ProtectedRoute>
                                    <MessagesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/messages/:userId"
                            element={
                                <ProtectedRoute>
                                    <MessagesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/about"
                            element={
                                <PublicRoute>
                                    <AboutPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/contact"
                            element={
                                <PublicRoute>
                                    <ContactPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/terms"
                            element={<TermsPage />}
                        />
                        <Route
                            path="/privacy"
                            element={<PrivacyPage />}
                        />
                        <Route
                            path="*"
                            element={<NotFoundPage />}
                        />
                    </Routes>
                    <Toaster />
                </main>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
