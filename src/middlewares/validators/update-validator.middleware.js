import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";
import { MIN_PASSWORD_LENGTH } from "../../constants/auth.constant.js";

const schema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
    "string.email": MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
  }),
  name: Joi.string().required().messages({
    "any.required": MESSAGES.AUTH.COMMON.NAME.REQUIRED,
  }),
  nickname: Joi.string().required().messages({
    "any.required": MESSAGES.AUTH.COMMON.NICKNAME.REQUIRED,
  }),
  newpassword: Joi.string().required().min(MIN_PASSWORD_LENGTH).messages({
    "any.required": MESSAGES.AUTH.COMMON.PASSWORD.REQUIRED,
    "string.min": MESSAGES.AUTH.COMMON.PASSWORD.LENGTH,
  }),
  passwordConfirm: Joi.string()
    .required()
    .valid(Joi.ref("newpassword"))
    .messages({
      "any.required": MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.REQUIRED,
      "any.only":
        MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.NOT_MATCHED_WITH_PASSWORD,
    }),
});

export const updateValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
