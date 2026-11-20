import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class GlowUpErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#160F14] px-6 text-[#FFF9F0]">
          <div className="glow-glass max-w-lg rounded-2xl p-8 text-center">
            <p className="text-xs font-medium tracking-[0.22em] text-[#D9B18C]">
              GLOWUP · RECOVERY
            </p>
            <h1 className="font-editorial mt-3 text-3xl text-[#FFF9F0]">
              Something interrupted your session.
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-[#F5DDE6]/80">
              Your saved account data remains protected. Please reload to continue your beauty journey.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 min-h-[44px] cursor-pointer rounded-full bg-[#D9B18C] px-6 py-2.5 text-xs font-semibold text-[#1D1119] hover:bg-[#E7C6A5]"
            >
              Reload GlowUp
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
