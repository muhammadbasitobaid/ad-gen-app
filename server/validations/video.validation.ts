import Joi from "joi";

export function validateVideoBody(body: { useCase: string; prompt: string }) {
  const schema = Joi.object({
    useCase: Joi.string().required(),
    prompt: Joi.string().required(),
  });

  return schema.validate(body);
}
