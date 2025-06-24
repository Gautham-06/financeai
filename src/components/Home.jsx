import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h1 className={`text-6xl font-bold mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Smart Finance Management
            </span>
          </h1>
          <p className={`text-xl text-gray-300 mb-12 max-w-3xl mx-auto ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Transform your financial data into actionable insights with our AI-powered platform
          </p>
          <div className={`flex justify-center gap-4 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300">
              Get Started
            </button>
            <button className="px-8 py-3 glass-card hover:bg-white/10 rounded-lg transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Real-time Analytics', description: 'Monitor your financial metrics in real-time with interactive dashboards', icon: '📊' },
            { title: 'AI Predictions', description: 'Get AI-powered insights and predictions for better financial decisions', icon: '🤖' },
            { title: 'Secure Storage', description: 'Bank-level encryption for all your sensitive financial data', icon: '🔒' },
            { title: 'Smart Reports', description: 'Automatically generated reports with actionable insights', icon: '📈' },
            { title: 'Mobile Access', description: 'Access your finances anywhere with our mobile app', icon: '📱' },
            { title: '24/7 Support', description: 'Round-the-clock support for all your financial needs', icon: '💬' }
          ].map((feature, index) => (
            <div
              key={index}
              className={`glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '98%', label: 'Customer Satisfaction' },
              { value: '24/7', label: 'Support Available' },
              { value: '10k+', label: 'Active Users' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.3 * index}s` }}
              >
                <div className="text-5xl font-bold text-blue-400 mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className={`glass-card rounded-2xl p-12 text-center ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}> 
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Financial Management?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already making smarter financial decisions with our platform.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 animate-pulse">
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
} 