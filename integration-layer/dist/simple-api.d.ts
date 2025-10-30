/**
 * Simple API Server for DataSov Integration Layer
 *
 * This is a simplified version for demo purposes that provides
 * the necessary API endpoints without full blockchain integration.
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}
declare const app: import("express-serve-static-core").Express;
export default app;
//# sourceMappingURL=simple-api.d.ts.map