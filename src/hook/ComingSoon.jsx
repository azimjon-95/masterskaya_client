import React, { useState, useEffect } from 'react';

export default function ComingSoon() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'rgb(0, 68, 119)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background circles */}
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                top: '-100px',
                left: '-100px',
                animation: 'float 6s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                bottom: '-50px',
                right: '-50px',
                animation: 'float 8s ease-in-out infinite'
            }} />

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <div style={{
                textAlign: 'center',
                zIndex: 1,
                maxWidth: '800px',
                animation: 'slideIn 1s ease-out'
            }}>
                {/* Logo/Icon */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    transform: 'rotate(-5deg)',
                    transition: 'transform 0.3s ease'
                }}>
                    <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                </div>

                {/* Main Heading */}
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '20px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}>
                    Tez Orada{dots}
                </h1>

                {/* Subtitle */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '30px',
                    letterSpacing: '-1px'
                }}>
                    Coming Soon{dots}
                </h2>

                {/* Description */}
                <p style={{
                    fontSize: '1.25rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '15px',
                    lineHeight: '1.8'
                }}>
                    Biz yangi web ilovamiz ustida ishlamoqdamiz
                </p>

                <p style={{
                    fontSize: '1.1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '50px',
                    lineHeight: '1.8'
                }}>
                    We are working on our new web application
                </p>

                {/* Company Badge */}
                <a
                    href="https://t.me/azimjon_m"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        padding: '15px 40px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        <span style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: 'white',
                            letterSpacing: '0.5px'
                        }}>
                            SmartBrain IT Company
                        </span>
                    </div>
                </a>

                {/* Progress indicator */}
                <div style={{
                    marginTop: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.5)',
                                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}