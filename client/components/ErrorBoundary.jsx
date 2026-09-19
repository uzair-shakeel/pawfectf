"use client";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || String(this.state.error || "Unknown error");
      const stack = this.state.error?.stack || "";
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F172A] px-4 text-white">
          <div className="max-w-xl text-center">
            <h2 className="mb-3 text-xl font-semibold">Something went wrong</h2>
            <p className="mb-4 break-words rounded bg-black/40 p-3 text-left font-mono text-sm text-red-300">
              {message}
            </p>
            {stack ? (
              <pre className="mb-4 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-black/30 p-3 text-left text-[11px] text-gray-400">
                {stack}
              </pre>
            ) : null}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
