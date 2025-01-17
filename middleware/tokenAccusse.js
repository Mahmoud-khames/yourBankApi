const jwt = require("jsonwebtoken");

const tokenAccusse = async (req, res, next) => {
    try {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header.split(" ")[1]) {
            res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            status: "fail",
            message: "Unauthorized",
        });
    }
};
module.exports = tokenAccusse