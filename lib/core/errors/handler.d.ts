declare class ErrorHandler extends Error {
    protected statusCode: number;
    protected errors: unknown[];
    constructor(message: string, statusCode?: number);
    setErrors(errors: unknown[]): ErrorHandler;
    getErrors(): unknown[];
    getStatusCode(): number;
    getMessage(): string;
    extractMessage(message: any): string;
}
export default ErrorHandler;
//# sourceMappingURL=handler.d.ts.map