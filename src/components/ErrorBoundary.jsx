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
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-5 text-center">
          <div className="bg-dark-100/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md shadow-2xl">
            <h2 className="text-white text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-100/60 mb-6 font-medium">
              We encountered an unexpected error. This might be due to a service interruption or a technical glitch.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-6 text-red-400 text-xs text-left overflow-auto p-4 bg-black/20 rounded-lg border border-red-500/20">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
