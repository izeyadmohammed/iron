import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-zinc-50 dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6 text-center"
        >
          <div className="max-w-md bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            <h1 className="text-xl font-bold">تعذر تحميل الصفحة بشكل كامل</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              حدث خطأ مؤقت أثناء العرض. يمكنك إعادة تحميل الصفحة للمتابعة.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
