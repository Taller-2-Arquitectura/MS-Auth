const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { mariadb, postgres } = require("../database/prisma");

const login = async (call, callback) => {
  const { email, password } = call.request;

  const user = await mariadb.users.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return callback({ code: 16, message: "Credenciales incorrectas" });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  await postgres.authToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  callback(null, {
    token,
    user: {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      rol: user.rol,
    },
  });
};

const updatePassword = async (call, callback) => {
  const { userId, requesterId, currentPassword, newPassword, confirmNewPassword } = call.request;

  if (userId !== requesterId) {
    return callback({ code: 7, message: "No autorizado" });
  }

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return callback({ code: 3, message: "Debe llenar los campos" });
  }

  if (newPassword !== confirmNewPassword) {
    return callback({ code: 3, message: "Las contraseñas no coinciden" });
  }

  const user = await mariadb.users.findUnique({ where: { id: userId } });

  if (!user) {
    return callback({ code: 5, message: "Usuario no encontrado" });
  }

  const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrectPassword) {
    return callback({ code: 16, message: "La contraseña actual es incorrecta" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await mariadb.users.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  callback(null, { message: "Contraseña actualizada" });
};

const AuthService = {
  login,
  updatePassword,
};

module.exports = AuthService;