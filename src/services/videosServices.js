const Videos = require("../../../database/models/videosModel");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/appError");
const { status } = require("@grpc/grpc-js");

const getAllVideos = catchAsync(async (call, callback) => {
    const videos = await Videos.find().populate("creator");
  return callback(null, { data: videos });
});

const getVideoById = catchAsync(async (call, callback) => {
  const videos = await Videos.findOne({ id: call.request.id });
  if (!videos) {
    return next(new AppError("No se encontro el video", 404));
  }
  return callback(null, videos);
});

const createVideo = catchAsync(async (call, callback) => {
    const { title } = call.request;
    if (!call.request.user) {
      return next(new AppError("Debe iniciar sesion", 401));
    }
    if (call.request.user.rol !== "Administrador") {
      return next(new AppError("No autorizado", 403));
    }
    if (!title) {
      throw new AppError("Se requiere titulo", 400);
    }
    const { description } = call.request;
    if (!description) {
      throw new AppError("Se requiere descripcion", 400);
    }
    const { genre } = call.request;
    if (!genre) {
      throw new AppError("Se requiere genero", 400);
    }
  
    const newVideo = await Videos.create({ title,description,genre });
    return callback(null, newVideo);
});

const updateVideo = catchAsync(async (call, callback) => {
  if (!call.request.user) {
    return next(new AppError("Debe iniciar sesion", 401));
  }
  if (call.request.user.rol !== "Administrador") {
    return next(new AppError("No autorizado", 403));
  }
  const allowedFields = ["title", "description", "genre"];
  const updateData = {};

  for (let field of allowedFields) {
    if (field in req.body) {
      updateData[field] = req.body[field];
    }
  }
    const video = await Videos.findOneAndUpdate(
      { id: call.request.id },
      call.request,
      { new: true, runValidators: true }
    );
    if (!video) {
      return next(new AppError("No se encontro el video", 404));
    }
    return callback(null, video);
});

const deleteVideo = catchAsync(async (call, callback) => {
  if (!req.user) {
    return next(new AppError("Debe iniciar sesion", 401));
  }
  if (req.user.rol !== "Administrador") {
    return next(new AppError("No autorizado", 403));
  }
    const video = await Videos.findOneAndUpdate({ id: call.request.id },
      { available: false },
      { new: true });
    if (!video) {
      return next(new AppError("No se encontro el video", 404));
    }
    return callback(null, video);
});

const VideosService = { getAllVideos, createVideo, getVideoById, updateVideo, deleteVideo };
module.exports = VideosService;