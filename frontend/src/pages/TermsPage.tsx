import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service (ToS) — KL Unity</h1>
                <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-lg max-w-none">
                    <p className="lead">
                        Welcome to KL Unity, the official community platform for KL University students, faculty, and administrators (“Users”).
                        By accessing or using this platform, you agree to comply with these Terms of Service and the KL University Code of Conduct.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Eligibility</h2>
                    <p>Access to KL Unity is restricted to individuals with a valid @kluniversity.in email ID.</p>
                    <p>Users are classified as:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li><strong>Students</strong> – automatically verified on signup.</li>
                        <li><strong>Faculty</strong> – pending admin verification.</li>
                        <li><strong>Admins</strong> – authorized by KL University.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Account Responsibilities</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Users must maintain the confidentiality of their login credentials.</li>
                        <li>Sharing or using another person’s account is strictly prohibited.</li>
                        <li>Users must provide accurate information, including their name, department, and role.</li>
                        <li>Accounts may be suspended or removed for violating these terms or university policies.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Acceptable Use Policy</h2>
                    <p>All interactions within KL Unity must comply with KL University’s Code of Conduct.</p>
                    <p>Prohibited activities include:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Posting or sharing offensive, discriminatory, or obscene content.</li>
                        <li>Spreading false information, hate speech, or harassment.</li>
                        <li>Uploading unauthorized or copyrighted material without permission.</li>
                        <li>Engaging in academic dishonesty or promoting prohibited activities.</li>
                        <li>Using profanity or blacklisted words (as determined by admins).</li>
                    </ul>
                    <p>Admins reserve the right to remove content, issue warnings, or suspend accounts that violate these rules.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Admin Rights</h2>
                    <p>Administrators may:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Approve or deny faculty accounts.</li>
                        <li>Review user activity and posts for compliance.</li>
                        <li>Remove or moderate inappropriate content.</li>
                        <li>Manage and update the list of restricted words or topics.</li>
                        <li>Temporarily suspend users or delete accounts violating terms.</li>
                    </ul>
                    <p>All actions by admins are logged and subject to internal review.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">5. Content Ownership</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Users retain ownership of the content they create (posts, comments, uploads).</li>
                        <li>By posting, users grant KL Unity a non-exclusive, royalty-free license to display and distribute content within the community.</li>
                        <li>Content may not be used for external or commercial purposes without consent.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">6. Privacy & Data Protection</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>All user data (name, email, department, posts, etc.) is handled in accordance with the Privacy Policy.</li>
                        <li>The platform does not share user data with third parties outside KL University.</li>
                        <li>Admins can access necessary data only for moderation and safety purposes.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">7. Academic & Behavioral Integrity</h2>
                    <p>Users must maintain decorum consistent with KL University’s academic and ethical guidelines.</p>
                    <p>Any misconduct or violation reported may lead to disciplinary action under university regulations.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>
                    <p>KL Unity reserves the right to suspend or terminate accounts that:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Breach the Terms of Service or Code of Conduct.</li>
                        <li>Are inactive for prolonged periods.</li>
                        <li>Attempt to manipulate or exploit platform features.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to Terms</h2>
                    <p>These Terms may be updated periodically. Continued use of the platform after updates indicates acceptance of the new terms.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact</h2>
                    <p>For queries or issues, contact the platform admin at <a href="mailto:klunity@zeroonedevs.in" className="text-blue-600 hover:underline">klunity@zeroonedevs.in</a></p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
