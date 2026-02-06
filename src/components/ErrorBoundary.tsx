import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">¡Ups! Algo salió mal.</h1>
                    <p className="text-gray-700 mb-2">Se ha producido un error inesperado en la aplicación.</p>
                    <div className="bg-white p-4 rounded shadow-md w-full max-w-2xl overflow-auto text-left mb-6 max-h-[400px]">
                        <p className="font-mono text-sm text-red-500 mb-2 font-bold">{this.state.error?.toString()}</p>
                        <pre className="font-mono text-xs text-gray-500 whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Recargar Página
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
