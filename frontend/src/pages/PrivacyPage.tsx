import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy — KL Unity</h1>
                <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-lg max-w-none">
                    <p className="lead">
                        KL Unity (“we”, “our”, or “us”) is committed to protecting your privacy and maintaining a safe online environment for all members of the KL University community.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
                    <p>We collect the following data:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li><strong>Account Information:</strong> Name, @kluniversity.in email, department, and role.</li>
                        <li><strong>Usage Data:</strong> Posts, comments, and interactions within the platform.</li>
                        <li><strong>Technical Data:</strong> IP address, device info, and login timestamps for security.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
                    <p>We use collected data to:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Verify your KL University identity.</li>
                        <li>Enable community interaction and communication.</li>
                        <li>Moderate content and ensure compliance with the Code of Conduct.</li>
                        <li>Improve platform performance and security.</li>
                    </ul>
                    <p>We never sell or share your data with advertisers or third-party companies.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Access & Visibility</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Admins can access user data solely for moderation and verification purposes.</li>
                        <li>Faculty and Students can view only publicly shared posts and profiles.</li>
                        <li>Private messages (if any) are end-to-end protected and not accessible to admins.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Content Moderation</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>The platform uses both manual review and automated filters (e.g., blacklisted words).</li>
                        <li>Content that violates university guidelines may be removed.</li>
                        <li>Repeat violations can result in account suspension.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>All user information is stored securely on encrypted servers.</li>
                        <li>Regular audits ensure compliance with university IT policies.</li>
                        <li>Users should report suspicious activity immediately to admins.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Retention</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Account and post data are retained as long as you are part of KL University.</li>
                        <li>Upon graduation or faculty exit, accounts may be archived or deleted.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights</h2>
                    <p>Users may:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Request correction or deletion of their data.</li>
                        <li>Opt out of receiving system notifications (non-critical).</li>
                        <li>Report privacy concerns to the admin team.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">8. Policy Updates</h2>
                    <p>We may revise this Privacy Policy periodically to improve clarity or comply with updated university or legal requirements.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact</h2>
                    <p>For privacy or data-related concerns: <a href="mailto:privacy@kluniversity.in" className="text-blue-600 hover:underline">privacy@kluniversity.in</a></p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
