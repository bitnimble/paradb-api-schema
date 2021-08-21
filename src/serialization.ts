import * as msgpackr from 'msgpackr';

type Serializer<T, S> = (t: T, parent?: string) => S;
type Deserializer<T> = (s: unknown, parent?: string) => T;
export type Type<T, S> = readonly [
  Serializer: Serializer<T, S>,
  Deserializer: Deserializer<T>,
];

export type Reify<Schema> = Schema extends Record<string, Type<any, any>>
    ? { [K in keyof Schema]: ReturnType<Schema[K][1]> }
    : Schema extends Type<infer T, any> ? T extends Array<infer I> ? I
    : T
    : Schema extends Serializer<infer T, any> ? T
    : Schema extends Deserializer<infer T> ? T
    : never;

class InvalidTypeError extends Error {
  constructor(name: string, expectedType: string, value: any) {
    super(`Expected ${name} to be ${expectedType} but found type ${typeof value} instead, with value ${
        JSON.stringify(value)
    }`);
  }
}

const validateBool = <T extends boolean>(name: string, literalValue: T, b: unknown) => {
  if (typeof b !== 'boolean') {
    throw new InvalidTypeError(name, 'boolean', b);
  }
  if (b !== literalValue) {
    throw new InvalidTypeError(name, literalValue.toString(), b);
  }
  return b as T;
};
export const bool = <T extends boolean>(name: string, value: T): Type<T, boolean> => [
  (b: T) => validateBool(name, value, b),
  (raw: unknown) => validateBool(name, value, raw),
];

type StringValidatorOpts = {
  maxLength?: number,
};
const validateString = (name: string, s: unknown, o?: StringValidatorOpts) => {
  if (typeof s !== 'string') {
    throw new InvalidTypeError(name, 'string', s);
  }
  if (o?.maxLength != null && s.length > o.maxLength) {
    throw new Error(`Expected ${name} to be less than ${o.maxLength} characters, but was ${s.length} instead`);
  }
  return s;
};
export const str = (name: string, o?: StringValidatorOpts): Type<string, string> =>
    [
      (s: string) => validateString(name, s, o),
      (_, raw: unknown) => validateString(name, raw, o),
    ] as const;

const validateNumber = (name: string, n: unknown) => {
  if (typeof n !== 'number') {
    throw new InvalidTypeError(name, 'number', n);
  }
  return n;
};
export const num = (name: string): Type<number, number> =>
    [
      (n: number) => validateNumber(name, n),
      (n: unknown) => validateNumber(name, n),
    ] as const;

const validateu8Array = (name: string, a: unknown) => {
  if (!(a instanceof Uint8Array)) {
    throw new InvalidTypeError(name, 'u8array', a);
  }
  return a;
};
export const u8array = (name: string): Type<Uint8Array, Uint8Array> =>
    [
      (a: Uint8Array) => validateu8Array(name, a),
      (a: unknown) => validateu8Array(name, a),
    ] as const;

export function optional<
    S extends Type<any, any>,
>(schema: S): Type<
    Reify<S> | undefined,
    (S extends Type<any, infer S> ? S : never) | undefined
> {
  return [
    (t, parent) => {
      if (typeof t != null) {
        return schema[0](t, parent);
      }
      return t;
    },
    (o, parent) => {
      if (o == null) {
        return;
      }
      return schema[1](o, parent);
    },
  ] as const;
}

export function rec<S extends Record<string, Type<any, any>>>(
    name: string,
    schema: S,
): Type<Reify<S>, Uint8Array> {
  return [
    (t, parent) => {
      // Test all property constraints
      for (const [_key, validator] of Object.entries(schema)) {
        const key = _key as keyof Reify<S>;
        const propValue = (t as any)[key];
        (validator as Type<any, any>)[0](propValue, name);
      }
      // TODO: separate validation and serialization, to avoid unnecessary packing at every level
      return msgpackr.pack(t);
    },
    (_o, parent) => {
      let o: unknown;
      if (parent == null) {
        o = msgpackr.unpack(_o as Uint8Array);
      } else if (typeof _o === 'object') {
        o = _o;
      } else {
        throw new InvalidTypeError(name, 'object', o);
      }
      // Test all property constraints
      for (const [_key, validator] of Object.entries(schema)) {
        const key = _key as keyof Reify<S>;
        const propValue = (o as any)[key];
        (validator as Type<any, any>)[1](propValue, name);
      }
      return o as Reify<S>;
    },
  ] as const;
}

export function extend<
    B extends Type<any, Uint8Array>,
    S extends Record<string, Type<any, any>>,
>(name: string, base: B, schema: S): Type<Reify<B> & Reify<S>, Uint8Array> {
  return [
    (t, parent) => {
      const [baseSerializer] = base;
      baseSerializer(t, name);
      // Test all property constraints
      for (const [_key, validator] of Object.entries(schema)) {
        const key = _key as keyof Reify<S>;
        const propValue = (t as any)[key];
        (validator as Type<any, any>)[0](propValue, name);
      }
      if (parent != null) {
        return t;
      }
      return msgpackr.pack(t);
    },
    (_o, parent) => {
      let o: unknown;
      if (parent == null) {
        o = msgpackr.unpack(_o as Uint8Array);
      } else if (typeof _o === 'object') {
        o = _o;
      } else {
        throw new InvalidTypeError(name, 'object', o);
      }
      const [_, baseDeserializer] = base;
      baseDeserializer(o, name);
      // Test all property constraints
      for (const [_key, validator] of Object.entries(schema)) {
        const key = _key as keyof Reify<S>;
        const propValue = (o as any)[key];
        (validator as Type<any, any>)[1](propValue, name);
      }
      return o as Reify<B> & Reify<S>;
    },
  ] as const;
}

export function union<
    D extends string,
    B extends Type<any, Uint8Array>,
    S extends B[],
>(name: string, discriminator: D, schemas: S): Type<Reify<S[0]>, Uint8Array> {
  return [
    (t, parent) => {
      for (const schema of schemas) {
        try {
          const [serializer] = (schema as unknown as Type<any, any>);
          serializer(t, name);
          break;
        } catch (e) {
          continue;
        }
      }
      if (parent != null) {
        return t;
      }
      return msgpackr.pack(t);
    },
    (_o, parent) => {
      let o: unknown;
      if (parent == null) {
        o = msgpackr.unpack(_o as Uint8Array);
      } else if (typeof _o === 'object') {
        o = _o;
      } else {
        throw new InvalidTypeError(name, 'union', o);
      }
      for (const schema of schemas) {
        try {
          const [_, deserializer] = (schema as unknown as Type<any, any>);
          deserializer(o, name);
          return o as Reify<S[0]>;
        } catch (e) {
          continue;
        }
      }
      throw new InvalidTypeError(name, 'union', o);
    },
  ] as const;
}

// TODO: support top level lists (i.e. add JSON.parse and JSON.serialize)
export function list<S extends Type<any, any>>(
    name: string,
    itemSchema: S,
): Type<Reify<S>[], any> {
  return [
    (t, parent) => {
      if (parent != null) {
        return t;
      }
      for (const i of t) {
        itemSchema[0](i, name);
      }
      return msgpackr.pack(t);
    },
    (_a, parent) => {
      let a;
      if (parent == null) {
        a = msgpackr.unpack(_a as Uint8Array);
      } else if (Array.isArray(_a)) {
        a = _a;
      } else {
        throw new InvalidTypeError(name, 'array', a);
      }
      for (const i of a) {
        itemSchema[1](i, name);
      }
      return a as Reify<S>[];
    },
  ] as const;
}
