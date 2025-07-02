import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Dumbbell, Mail, Lock, User, Sparkles, Shield, Zap } from 'lucide-react';

export default function Login() {
  const { user, login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      if (isSignup) {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        success = await signup(email, password, name);
        if (!success) {
          setError('Email already exists');
        }
      } else {
        success = await login(email, password);
        if (!success) {
          setError('Invalid email or password');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Dumbbell,
      title: 'Track Workouts',
      description: 'Log your sets, reps, and weights'
    },
    {
      icon: Sparkles,
      title: 'Smart Templates',
      description: 'Create custom workout routines'
    },
    {
      icon: Shield,
      title: 'Progress Analytics',
      description: 'Monitor your fitness journey'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-cyan-400/10" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="space-y-8 text-center lg:text-left animate-slide-in-left">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-500/25 animate-pulse-glow">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-50">
                  The Bert Locker
                </h1>
                <p className="text-slate-400 text-lg">Your Ultimate Fitness Companion</p>
              </div>
            </div>
            <p className="text-xl text-slate-300 max-w-md mx-auto lg:mx-0">
              Transform your fitness journey with intelligent workout tracking and personalized analytics.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover-lift animate-slide-in-left"
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  <div className="p-3 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg">
                    <Icon className="h-6 w-6 text-pink-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-50">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="animate-slide-in-right delay-300">
          <Card variant="glass" className="border border-slate-700 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-slate-50 mb-2">
                {isSignup ? 'Create Your Account' : 'Welcome Back'}
              </CardTitle>
              <p className="text-slate-400">
                {isSignup ? 'Join thousands of fitness enthusiasts' : 'Continue your fitness journey'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignup && (
                  <Input
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignup}
                    placeholder="Enter your full name"
                    icon={<User className="h-5 w-5" />}
                  />
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  icon={<Mail className="h-5 w-5" />}
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  icon={<Lock className="h-5 w-5" />}
                />

                {isSignup && (
                  <p className="text-xs text-slate-400">
                    Password must be at least 6 characters long
                  </p>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  loading={loading}
                >
                  {!loading && <Zap className="h-5 w-5 mr-2" />}
                  {isSignup ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                    setEmail('');
                    setPassword('');
                    setName('');
                  }}
                  className="text-pink-400 hover:text-pink-300 text-sm transition-colors font-medium"
                >
                  {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

              {/* Demo Credentials */}
              {!isSignup && (
                <Card variant="glass" className="bg-slate-800/30 border-slate-600">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-300 text-center mb-3 font-medium flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4" />
                      Demo Account
                    </p>
                    <div className="space-y-1 text-xs text-slate-400 text-center">
                      <p><span className="font-medium">Email:</span> demo@example.com</p>
                      <p><span className="font-medium">Password:</span> demo123</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Your fitness journey starts here. Train smart, train consistently.
          </p>
        </div>
      </div>
    </div>
  );
}