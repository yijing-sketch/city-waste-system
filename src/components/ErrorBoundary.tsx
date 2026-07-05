import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center h-full bg-[#0a0e17]">
          <div className="text-center p-8 max-w-md">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={28} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">页面渲染异常</h2>
            <p className="text-sm text-slate-400 mb-1">
              {this.state.error?.message || '未知错误'}
            </p>
            <p className="text-xs text-slate-600 mb-5">请尝试刷新页面或检查网络连接</p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw size={15} />
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
