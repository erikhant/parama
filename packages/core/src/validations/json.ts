import Ajv, { ErrorObject, Options } from 'ajv';

export class JsonValidator {
  private ajv: Ajv;

  constructor(options?: Options) {
    this.ajv = new Ajv({
      allErrors: true,
      coerceTypes: 'array',
      ...options
    });
  }

  validate(schema: object, data: any) {
    const validateFn = this.ajv.compile(schema);
    const isValid = validateFn(data);

    return {
      isValid,
      errors: validateFn.errors || [],
      formattedErrors: this.formatErrors(validateFn.errors || undefined)
    };
  }

  private formatErrors(errors: ErrorObject[] = []) {
    return errors.map((err) => {
      const field = err.instancePath.replace('/', '');
      return `${field} ${err.message}`;
    });
  }
}
