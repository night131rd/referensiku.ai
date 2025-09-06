'use client'

import React, { useState, useEffect } from 'react'
import { Brain, Search, BookOpen, CheckCircle, Sparkles } from 'lucide-react'

interface EnhancedLoadingProps {
  currentStep?: number
  progress?: number
  journalsFound?: number
}

const loadingSteps = [
  {
    icon: Search,
    title: "🔍 Menganalisis pertanyaan...",
    description: "Memahami konteks dan maksud pencarian Anda"
  },
  {
    icon: BookOpen,
    title: "📚 Mencari jurnal relevan...",
    description: "Menjelajahi database akademis internasional"
  },
  {
    icon: Brain,
    title: "🧠 Memproses informasi...",
    description: "Menganalisis dan mensintesis data dari sumber terpercaya"
  },
  {
    icon: Sparkles,
    title: "✨ Menyusun jawaban...",
    description: "Membuat jawaban komprehensif berdasarkan penelitian"
  }
]

export function EnhancedLoading({ currentStep = 0, progress = 0, journalsFound = 0 }: EnhancedLoadingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Progress Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Memproses Pencarian Anda
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <span className="font-bold text-blue-600">{Math.round(animatedProgress)}%</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>

        {/* Current Step Display */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {React.createElement(loadingSteps[currentStep]?.icon || Search, {
              className: "w-8 h-8 text-blue-600 animate-pulse"
            })}
          </div>
          <div className="flex-grow">
            <h4 className="font-medium text-gray-900">
              {loadingSteps[currentStep]?.title || "Memproses..."}
            </h4>
            <p className="text-sm text-gray-600">
              {loadingSteps[currentStep]?.description || "Mohon tunggu sebentar"}
            </p>
          </div>
          {journalsFound > 0 && (
            <div className="text-right animate-in slide-in-from-right duration-300">
              <div className="text-2xl font-bold text-green-600">{journalsFound}</div>
              <div className="text-xs text-gray-600">Jurnal Ditemukan</div>
            </div>
          )}
        </div>
      </div>

      {/* Answer Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 animate-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Jawaban AI</h3>
          <span className="text-sm text-blue-600 animate-pulse">(sedang diproses...)</span>
        </div>

        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      {/* References Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 animate-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Referensi</h3>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simple loading spinner for inline use
export function SimpleLoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-b-blue-200 border-l-blue-200 border-r-blue-200 animate-spin"></div>
      </div>
    </div>
  )
}

// Step-by-step progress indicator
export function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i < currentStep
              ? "bg-green-500 scale-110"
              : i === currentStep
                ? "bg-blue-500 animate-pulse scale-125"
                : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  )
}
