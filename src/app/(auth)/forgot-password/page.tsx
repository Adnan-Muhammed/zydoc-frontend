import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
    title: "Forgot Password | Zydoc",
    description: "Reset your Zydoc password to regain access to your account.",
};

export default function ForgotPasswordPage() {
    return (
        <main className="flex-1 flex items-center justify-center w-full mt-[70px] px-6">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-center">
                
                {/* Left: static marketing copy */}
                <div className="text-left space-y-4">
                    <Badge variant="primary" pill>
                        <i className="fas fa-key mr-1"></i> Password Recovery
                    </Badge>
                    <h1 className="text-4xl font-bold">Reset Password</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Don't worry, we'll help you get back into your account securely.
                    </p>
                    <ul className="space-y-2 text-slate-500 text-sm">
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Secure OTP verification</li>
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Instant password update</li>
                    </ul>
                </div>

                {/* Right: Client Component Form */}
                <div className="bg-white dark:bg-slate-900 py-12 px-12 shadow-xl rounded-2xl">
                    <ForgotPasswordForm />
                </div>

            </div>
        </main>
    );
}
