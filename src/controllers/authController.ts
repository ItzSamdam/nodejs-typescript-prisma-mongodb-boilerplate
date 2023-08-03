import httpStatus from 'http-status';
import catchAsync from '../utilities/catchAsync';
import { authService, userService, tokenService, emailService } from '../services';
import exclude from '../utilities/exclude';
import { User } from '@prisma/client';
import logger from '../config/logger';

const register = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.createUser(email, password);
    const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user: userWithoutPassword, tokens });
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const logout = catchAsync(async (req, res) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const refreshTokens = catchAsync(async (req, res) => {
  try {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const forgotPassword = catchAsync(async (req, res) => {
  try {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
    await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const resetPassword = catchAsync(async (req, res) => {
  try {
    await authService.resetPassword(req.query.token as string, req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  try {
    const user = req.user as User;
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    await emailService.sendVerificationEmail(user.email, verifyEmailToken);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

const verifyEmail = catchAsync(async (req, res) => {
  try {
    await authService.verifyEmail(req.query.token as string);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (e) {
    logger.error(e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'something went wrong', error: e });
  }
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail
};
