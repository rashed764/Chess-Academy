import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Production telemetry or logger boundary
    console.error('Unhandled React Error Boundary Exception:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          role="alert" 
          className="min-h-screen bg-[#0B0D14] text-[#F4F4F5] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-[#171A24] border border-[#242938] rounded-xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 text-red-400 mb-5 border border-red-500/20">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>

            <h1 className="text-xl font-semibold text-[#F4F4F5] mb-2 font-cinzel">
              Unexpected System Exception
            </h1>
            <p className="text-[#9297A5] text-sm mb-6 leading-relaxed">
              Chess Academy encountered an unexpected runtime error. Your board state has been safeguarded.
            </p>

            {this.state.error && (
              <div className="bg-[#10121B] border border-[#242938] rounded-lg p-3 mb-6 text-left text-xs font-mono text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-[#242938] text-[#F4F4F5] hover:bg-[#1D2230] hover:border-[#D6B36A]/40 transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#D6B36A] text-[#0B0D14] hover:bg-[#E8CF96] font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Reload Academy
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
