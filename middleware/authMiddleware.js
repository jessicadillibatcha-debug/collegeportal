
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                message: 'Authorization token required'
            });
        }

        const [scheme, token] = authorization.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({
                message: 'Invalid authorization format'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');

            return res.status(500).json({
                message: 'Server configuration error'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        if (
            error.name === 'TokenExpiredError' ||
            error.name === 'JsonWebTokenError' ||
            error.name === 'NotBeforeError'
        ) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        console.error('Authentication error:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = authMiddleware;
