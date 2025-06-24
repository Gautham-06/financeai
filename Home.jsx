import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="mesh-pattern"></div>
        </div>
        
        <div className="hero-content">
          <h1 className={`hero-title ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}> 
            <span className="text-gradient-blue">
              Smart Finance Management
            </span>
          </h1>
          <p className={`hero-subtitle ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Transform your financial data into actionable insights with our AI-powered platform
          </p>
          <div className={`hero-buttons ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <button className="btn btn-gradient">
              Get Started
            </button>
            <button className="btn glass-card">
              Learn More
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-arrow">↓</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-section">
        <div className="container">
          <div className="features-grid">
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
                className={`feature-card ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 * index}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: '98%', label: 'Customer Satisfaction' },
              { value: '24/7', label: 'Support Available' },
              { value: '10k+', label: 'Active Users' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`stats-card ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.3 * index}s` }}
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className={`cta-card glass-card ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}> 
            <h2 className="cta-title">Ready to Transform Your Financial Management?</h2>
            <p className="cta-description">
              Join thousands of users who are already making smarter financial decisions with our platform.
            </p>
            <button className="btn btn-gradient animate-pulse">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 