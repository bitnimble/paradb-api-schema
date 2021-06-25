type Serializer<T> = (t: T, parent?: string) => T | string;
type Deserializer<T> = (s: unknown, parent?: string) => T;
export type Validator<T> = readonly [Serializer: Serializer<T>, Deserializer: Deserializer<T>];

type StringValidatorOpts = {
  maxLength?: number,
};

class InvalidTypeError extends Error {
  constructor(name: string, expectedType: string, value: any) {
    super(`Expected ${name} to be ${expectedType} but found type ${typeof value} instead, with value ${JSON.stringify(value)}`)
  }
}

export const bool = <T extends boolean>(name: string, value: T): Validator<T> => [
  (b: T) => b,
  (raw: unknown) => {
    if (typeof raw !== 'boolean') {
      throw new InvalidTypeError(name, 'boolean', raw);
    }
    if (raw !== value) {
      throw new InvalidTypeError(name, value.toString(), raw);
    }
    return raw as T;
  },
]

export const str = (name: string, o?: StringValidatorOpts): Validator<string> => [
  (s: string) => s,
  (raw: unknown) => {
    if (typeof raw !== 'string') {
      throw new InvalidTypeError(name, 'string', raw);
    }
    if (o?.maxLength != null && raw.length > o.maxLength) {
      throw new Error(`Expected ${name} to be less than ${o.maxLength} characters, but was ${raw.length} instead`);
    }
    return raw;
  },
] as const;

export const num = (name: string) => [
  (n: number) => n,
  (raw: unknown) => {
    if (typeof raw !== 'number') {
      throw new InvalidTypeError(name, 'number', raw);
    }
    return raw;
  },
] as const;

export function optional<S extends Validator<any>>(schema: S): Validator<Reify<S> | undefined> {
  return [
    (t, parent) => t,
    (o, parent) => {
      if (o == null) {
        return;
      }
      schema[1](o);
      return o as Reify<S>;
    },
  ] as const;
}

export type Reify<Schema> = Schema extends Record<string, Validator<any>>
  ? { [K in keyof Schema]: ReturnType<Schema[K][1]> }
  : Schema extends Validator<infer T>
    ? T extends Array<infer I>
      ? I
      : T
    : Schema extends Serializer<infer T>
      ? T
      : Schema extends Deserializer<infer T>
        ? T
        : never;

export function rec<S extends Record<string, Validator<any>>>(name: string, schema: S): Validator<Reify<S>> {
  return [
    (t, parent) => {
      if (parent != null) {
        return t;
      }
      return JSON.stringify(t);
    },
    (o, parent) => {
      if (typeof o !== 'object' || o == null) {
        throw new InvalidTypeError(name, 'object', o);
      }
      // Test all property constraints
      for (const [_key, validator] of Object.entries(schema)) {
        const key = _key as keyof Reify<S>;
        const propValue = (o as any)[key];
        (validator as Validator<any>)[1](propValue);
      }
      return o as Reify<S>;
    },
  ] as const;
}

export function extend<B extends Validator<any>, S extends Record<string, Validator<any>>>(name: string, base: B, schema: S): Validator<Reify<B> & Reify<S>> {
  return [
    (t, parent) => {
      if (parent != null) {
        return t;
      }
      return JSON.stringify(t);
    },
    (o, parent) => {
      if (typeof o !== 'object' || o == null) {
        throw new InvalidTypeError(name, 'object', o);
      }
      const [_, baseDeserializer] = base;
      baseDeserializer(o);
      // Test all property constraints
      for (const [_key, validator] of Object.entries(schema)) {
        const key = _key as keyof Reify<S>;
        const propValue = (o as any)[key];
        (validator as Validator<any>)[1](propValue);
      }
      return o as Reify<B> & Reify<S>;
    },
  ] as const;
}

export function union<
    D extends string,
    B extends Validator<any>,
    S extends B[],
>(name: string, discriminator: D, schemas: S): Validator<Reify<S[0]>> {
  return [
    (t, parent) => {
      if (parent != null) {
        return t;
      }
      return JSON.stringify(t);
    },
    (o, parent) => {
      if (typeof o !== 'object' || o == null) {
        throw new InvalidTypeError(name, 'union', o);
      }
      for (const schema of schemas) {
        try {
          const [_, deserializer] = (schema as unknown as Validator<any>);
          deserializer(o);
          return o as Reify<S[0]>;
        } catch (e) {
          continue;
        }
      }
      throw new InvalidTypeError(name, 'union', o);
    },
  ] as const;
}

export function arr<S extends Validator<any>>(name: string, itemSchema: S): Validator<Reify<S>[]> {
  return [
    (t, parent) => {
      if (parent != null) {
        return t;
      }
      return JSON.stringify(t);
    },
    (a, parent) => {
      if (!Array.isArray(a)) {
        throw new InvalidTypeError(name, 'array', a);
      }
      for (const i of a) {
        itemSchema[1](i);
      }
      return a as Reify<S>[];
    },
  ] as const;
}
