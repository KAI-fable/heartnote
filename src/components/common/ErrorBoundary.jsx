import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

// 错误边界：捕获子组件渲染异常，保证页面整体可用
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto my-6 max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertTriangle className="mx-auto text-rose-500" size={32} aria-hidden="true" />
          <p className="mt-2 font-hand text-lg text-rose-700">这里出了一点小状况 🥺</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 rounded-xl bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
