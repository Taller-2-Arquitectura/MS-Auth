const jwt = require("jsonwebtoken");
const { mariadb, postgres } = require("../database/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Debe iniciar sesión para acceder", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await mariadb.users.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser || currentUser.deletedAt) {
    return next(new AppError("El usuario ya no existe", 401));
  }

  const activeToken = await postgres.AuthToken.findUnique({
    where: { token },
  });

  if (!activeToken || new Date(activeToken.expiresAt) < new Date()) {
    return next(new AppError("Token expirado o inválido", 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.rol)) {
        return next(
          new AppError("No tiene permisos para realizar esta acción", 403)
        );
      }
      next();
    };
  };