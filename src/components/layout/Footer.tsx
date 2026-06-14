

// components/layout/Footer.tsx
import Link from 'next/link';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-grid">
                    <div className="footer-section">
                        <Link href="/" className="logo"><i className="fas fa-hospital-user"></i> Zydoc</Link>
                        <p>Your trusted healthcare platform.</p>
                    </div>
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/find-doctor">Find Doctors</Link></li>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#blog">Blog</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Company</h3>
                        <ul><li><a href="#">About</a></li>
                            <li><a href="#">Careers</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Support</h3>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li>Email: support@zydoc.com</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom"><p>© 2025 Zydoc. All rights reserved.</p></div>
            </div>
        </footer>
    )
}
export default Footer;
