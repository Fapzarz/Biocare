import { Heart, Search, Shield, Activity, ArrowRight, ChevronRight, Users, Sparkles } from 'lucide-react';
import { FAQ } from './FAQ';

interface LandingPageProps {
  onExplore: () => void;
  onViewFAQ: () => void;
  onViewPrivacy: () => void;
  onViewTerms: () => void;
  onViewStatus: () => void;
}

export function LandingPage({ onExplore, onViewFAQ, onViewPrivacy, onViewTerms, onViewStatus }: LandingPageProps) {
  const handleSearch = () => {
    onExplore();
  };

  const handleSecurity = () => {
    onViewPrivacy();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <Heart className="text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">BioCare</span>
        </div>
        <div className="flex space-x-4">
          <button onClick={onViewFAQ} className="text-gray-600 hover:text-blue-600">
            FAQ
          </button>
          <button onClick={onViewTerms} className="text-gray-600 hover:text-blue-600">
            Terms
          </button>
          <button onClick={onViewStatus} className="text-gray-600 hover:text-blue-600">
            Status
          </button>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 lg:min-h-screen flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(244,63,94,0.05)_0%,rgba(168,85,247,0.05)_50%,rgba(59,130,246,0.05)_100%)] dark:bg-[linear-gradient(40deg,rgba(244,63,94,0.1)_0%,rgba(168,85,247,0.1)_50%,rgba(59,130,246,0.1)_100%)]" />
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(244,63,94,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.1) 0%, transparent 50%)',
            animation: 'pulse 8s infinite'
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium text-rose-500">Revolutionizing Healthcare</span>
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  BioCare
                  <span className="block mt-2 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    Healthcare Platform
                  </span>
                </h1>
                
                <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl">
                  Access comprehensive healthcare information, connect with professionals, and manage your health journey with our advanced platform.
                </p>
              </div>

              <div>
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-full hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">100+</span>
                  <span className="text-sm text-slate-400">Diseases</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">50k+</span>
                  <span className="text-sm text-slate-400">Users</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">99%</span>
                  <span className="text-sm text-slate-400">Success Rate</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:flex justify-center">
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-purple-500/20 rounded-full blur-3xl" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-8 flex items-center justify-center">
                  <Heart className="w-24 h-24 text-rose-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-rose-600 dark:text-rose-500">Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Everything you need to manage your health
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Comprehensive tools and information to help you make informed healthcare decisions
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  name: 'Smart Search',
                  description: 'Find accurate information about diseases, symptoms, and treatments instantly.',
                  action: handleSearch,
                  color: 'rose'
                },
                {
                  icon: Shield,
                  name: 'Secure Platform',
                  description: 'Your health data is protected with enterprise-grade security.',
                  action: handleSecurity,
                  color: 'purple'
                },
                {
                  icon: Users,
                  name: 'Community Support',
                  description: 'Connect with healthcare professionals and others sharing similar experiences.',
                  action: handleSearch,
                  color: 'blue'
                }
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.name} className="relative group">
                    <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900 dark:text-slate-100">
                      <div className={`h-12 w-12 flex items-center justify-center rounded-xl bg-${feature.color}-500/10 dark:bg-${feature.color}-500/20 group-hover:bg-${feature.color}-500/20 dark:group-hover:bg-${feature.color}-500/30 transition-colors duration-200`}>
                        <Icon className={`h-6 w-6 text-${feature.color}-500 dark:text-${feature.color}-400`} />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </dd>
                    <button
                      onClick={feature.action}
                      className={`mt-4 inline-flex items-center text-sm font-medium text-${feature.color}-600 dark:text-${feature.color}-400 hover:text-${feature.color}-500 dark:hover:text-${feature.color}-300 group-hover:gap-1.5 transition-all duration-200`}
                    >
                      Learn more
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-rose-600 dark:text-rose-500">FAQ</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Frequently Asked Questions
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Find answers to common questions about BioCare
            </p>
          </div>
          <div className="mt-16">
            <FAQ />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-slate-900 dark:bg-slate-800 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
            <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(244,63,94,0.1)_0%,rgba(168,85,247,0.1)_50%,rgba(59,130,246,0.1)_100%)] dark:bg-[linear-gradient(40deg,rgba(244,63,94,0.2)_0%,rgba(168,85,247,0.2)_50%,rgba(59,130,246,0.2)_100%)]" />
            
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start your health journey today
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Join thousands of users who trust BioCare for their healthcare information needs.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-full hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 group"
                >
                  Get Started
                  <Activity className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}