'use client'

import React, { useState } from 'react';

const FloatingSupportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTooltip = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleTooltip}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 flex items-center space-x-2"
          aria-label="Bantuan dan Dukungan"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v6m0 6v6m6-9h-6m-6 0h6"
            />
          </svg>
          <span className="text-sm font-medium">Hubungi saya</span>
        </button>
      </div>

      {/* Simple Tooltip */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={toggleTooltip}
          />

          {/* Tooltip Content */}
          <div className="fixed bottom-20 right-6 z-50">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-xs animate-in slide-in-from-bottom-2 duration-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v6m0 6v6m6-9h-6m-6 0h6"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Ada pertanyaan atau butuh bantuan?
                </p>
                <a
                  href="mailto:jurnalgpt.student@gmail.com"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                  onClick={toggleTooltip}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Kirim Email
                </a>
              </div>

              {/* Arrow */}
              <div className="absolute -bottom-1 right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingSupportButton;
