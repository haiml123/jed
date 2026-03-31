'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PawBackground from '@/components/ui/paw-background';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (email.includes('director')) router.push('/director');
      else if (email.includes('admin')) router.push('/admin');
      else router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile branding header */}
      <div className="lg:hidden bg-[#f5f8ff] relative overflow-hidden py-8 flex flex-col items-center">
        <PawBackground />
        <div className="relative z-10 flex flex-col items-center">
          <Image src="/assets/shared/jed-logo.png" alt="JED" width={76} height={71} />
          <p className="font-heading text-sm font-extrabold text-[#0079c2] mt-2">Learning that connects</p>
        </div>
      </div>

      {/* Left side - Desktop Branding with paw prints and dog image */}
      <div className="flex-1 hidden lg:flex flex-col relative overflow-hidden bg-[#f5f8ff]">
        <PawBackground />

        {/* Dog image as background decoration */}
        <div className="absolute bottom-0 right-0 opacity-15">
          <Image
            src="/assets/home/jed-dog.png"
            alt=""
            width={427}
            height={569}
            aria-hidden
          />
        </div>

        {/* Branding text pinned to bottom */}
        <div className="mt-auto relative z-10 px-10 pb-12">
          <h2 className="font-heading text-lg font-extrabold text-primary">
            Learning that connects
          </h2>
          <p className="text-sm text-primary-dark mt-1">
            Professional development platform for teachers
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-5 py-8 lg:px-0 lg:py-0">
        <div className="w-[380px] space-y-8">
          {/* Logo */}
          <Image
            src="/assets/shared/jed-logo-login.png"
            alt="JED"
            width={76}
            height={71}
          />

          {/* Header */}
          <div>
            <h1 className="font-heading text-[21px] font-extrabold text-[#333]">
              Hey, let&apos;s connect?
            </h1>
            <p className="text-sm text-[#a8b5c5] mt-1">Welcome back</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full h-12 px-3.5 rounded-card border border-border bg-white text-[15px] text-text placeholder:text-text/50 focus:border-primary focus:bg-[#e8f0fe] outline-none transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-text">Password</label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#0079c2]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-3.5 pr-12 rounded-card border border-border bg-white text-[15px] text-text placeholder:text-text/50 focus:border-primary focus:bg-[#e8f0fe] outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-card bg-primary text-white font-semibold text-base hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="w-full h-12 rounded-card border border-border bg-white flex items-center justify-center gap-2 text-[15px] font-medium text-text hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </form>

          {/* Register link */}
          <p className="text-xs text-muted">
            Not registered yet?{' '}
            <button className="text-[13px] font-medium text-primary">
              Contact your administrator
            </button>
          </p>

          {/* Demo Login Guide */}
          <div className="bg-[#eff6ff] rounded-[20px] p-4">
            <p className="font-semibold text-xs text-text mb-3">
              Demo Login Guide:
            </p>
            <div className="space-y-2 text-[10.5px]">
              <button
                onClick={() => fillDemo('teacher@school.com')}
                className="flex items-center gap-2 w-full text-left hover:bg-white/50 rounded p-1 -m-1 transition-colors"
              >
                <span>👨‍🏫</span>
                <span className="font-bold text-text">
                  Teacher: teacher@school.com (or any email)
                </span>
              </button>
              <button
                onClick={() => fillDemo('director@school.com')}
                className="flex items-center gap-2 w-full text-left hover:bg-white/50 rounded p-1 -m-1 transition-colors"
              >
                <span>👔</span>
                <span className="font-bold text-text">
                  Director: director@school.com
                </span>
              </button>
              <button
                onClick={() => fillDemo('admin@school.com')}
                className="flex items-center gap-2 w-full text-left hover:bg-white/50 rounded p-1 -m-1 transition-colors"
              >
                <span>⚙️</span>
                <span className="font-bold text-text">
                  Admin: admin@school.com
                </span>
              </button>
              <div className="pt-1.5 border-t border-border/50 flex items-center gap-2">
                <span>🔑</span>
                <span className="font-bold text-text">
                  Password: password123 (minimum 6 characters)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
