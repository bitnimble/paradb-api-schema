import * as msgpackr from 'msgpackr';

export interface Type<T> {
  serialize(t: T): Uint8Array;
  deserialize(u: Uint8Array): T;
  validate(u: unknown): T;
}

export type Reify<Schema> =
    Schema extends Record<string, Type<any>> ? { [K in keyof Schema]: ReturnType<Schema[K]['validate']> }
    : Schema extends Type<infer T>
      ? T extends (infer I)[] ? I[]
      : T
    : Schema extends (t: infer T) => Uint8Array ? T
    : Schema extends (u: Uint8Array) => infer T ? T
    : never;

class InvalidTypeError extends Error {
  constructor(name: string, expectedType: string, value: any) {
    super(`Expected ${name} to be ${expectedType} but found type ${typeof value} instead, with value ${
        JSON.stringify(value)
    }`);
  }
}

abstract class TypeImpl<T> implements Type<T> {
  constructor(
    protected readonly name: string,
  ) { }

  readonly serialize = (t: T) => {
    const validated = this.validate(t);
    return msgpackr.pack(validated);
  }

  readonly deserialize = (u: Uint8Array) => {
    const unpacked = msgpackr.unpack(u);
    const validated = this.validate(unpacked);
    return validated;
  }

  abstract validate(u: unknown): T;
}

export const bool = <T extends boolean>(name: string, literalValue?: T): Type<T> => new BoolType<T>(name, literalValue);
class BoolType<T extends boolean> extends TypeImpl<T> {
  constructor(name: string, private readonly literalValue?: T) {
    super(name);
  }

  readonly validate = (b: unknown) => {
    if (typeof b !== 'boolean') {
      throw new InvalidTypeError(this.name, 'boolean', b);
    }
    if (this.literalValue != null && b !== this.literalValue) {
      throw new InvalidTypeError(this.name, this.literalValue.toString(), b);
    }
    return b as T;
  }
}

export const str = (name: string): Type<string> => new StringType(name);
class StringType extends TypeImpl<string> {
  readonly validate = (s: unknown) => {
    if (typeof s !== 'string') {
      throw new InvalidTypeError(this.name, 'string', s);
    }
    return s;
  }
}

export const num = (name: string): Type<number> => new NumberType(name);
class NumberType extends TypeImpl<number> {
  readonly validate = (n: unknown) => {
    if (typeof n !== 'number') {
      throw new InvalidTypeError(this.name, 'number', n);
    }
    return n;
  }
}

export const u8array = (name: string): Type<Uint8Array> => new Uint8ArrayType(name);
class Uint8ArrayType extends TypeImpl<Uint8Array> {
  readonly validate = (u: unknown) => {
    if (!(u instanceof Uint8Array)) {
      throw new InvalidTypeError(this.name, 'u8array', u);
    }
    return u;
  }
}

export const optional = <S extends Type<any>>(base: S): Type<Reify<S> | undefined> => new OptionalType<S>(base);
class OptionalType<T extends Type<any>> extends TypeImpl<Reify<T> | undefined> {
  constructor(private readonly base: T) {
    // TODO: wire parent name down into optionals
    super('');
  }

  readonly validate = (u: unknown): Reify<T> | undefined => {
    if (u != null) {
      return this.base.validate(u);
    }
    return undefined;
  }
}

// Use a dummy `V` type parameter to avoid nested property types from collapsing to `any`
export const rec = <V, S extends Record<string, Type<V>>>(name: string, schema: S): Type<Reify<S>> => new RecordType<V, S>(name, schema);
class RecordType<V, S extends Record<string, Type<V>>> extends TypeImpl<Reify<S>> {
  constructor(name: string, private readonly schema: S) {
    super(name);
  }

  readonly validate = (u: unknown, ignoredKeys?: string[]): Reify<S> => {
    if (typeof u !== 'object') {
      throw new InvalidTypeError(this.name, 'object', u);
    }
    const ignoredKeySet = new Set(ignoredKeys);
    let result: Partial<Reify<S>> = {};
    // Test all property constraints
    for (const [key, validator] of Object.entries(this.schema)) {
      if (ignoredKeySet.has(key)) {
        continue;
      }
      const propValue = (u as any)[key];
      const validatedValue = validator.validate(propValue);
      result[key as keyof Reify<S>] = validatedValue as any;
    }
    return result as Reify<S>;
  }
}

export const extend = <
  V, S extends Record<string, Type<V>>,
  BV, BS extends Record<string, Type<BV>>, B extends Type<Reify<BS>>, BR extends RecordType<BV, BS>
>(name: string, base: B, schema: S): Type<Omit<Reify<BS>, keyof Reify<S>> & Reify<S>> => new ExtendsType<V, S, BV, BS, BR>(name, base as unknown as BR, schema);
class ExtendsType<
  V, S extends Record<string, Type<V>>,
  BV, BS extends Record<string, Type<BV>>, B extends RecordType<BV, BS>
> extends TypeImpl<Omit<Reify<BS>, keyof Reify<S>> & Reify<S>> {
  private subtype: RecordType<V, S>;

  constructor(name: string, private readonly baseType: B, private readonly schema: S) {
    super(name);
    this.subtype = new RecordType(name, schema);
  }

  readonly validate = (u: unknown): Omit<Reify<BS>, keyof Reify<S>> & Reify<S> => {
    const ignoredKeys = Object.keys(this.schema);
    const baseResult = this.baseType.validate(u, ignoredKeys);
    const schemaResult = this.subtype.validate(u);
    return {
      ...baseResult,
      ...schemaResult,
    };
  }
}


export const union = <
    D extends string,
    B extends Type<any>,
    S extends B[],
>(name: string, discriminator: D, schemas: S): Type<Reify<S[0]>> => new UnionRecordType(name, discriminator, schemas);
class UnionRecordType<D extends string, B extends Type<object>, S extends B[]> extends TypeImpl<Reify<S[0]>> {
  constructor(name: string, private readonly discriminator: D, private readonly schemas: S) {
    super(name);
  }

  readonly validate = (u: unknown) => {
    for (const schema of this.schemas) {
      try {
        const validated = schema.validate(u) as Reify<S[0]>;
        return validated;
      } catch (e) {
        continue;
      }
    }
    throw new InvalidTypeError(this.name, 'union', u);
  }
}

export const list = <S extends Type<any>>(name: string, itemSchema: S): Type<Reify<S>[]> => new ListType(name, itemSchema);
class ListType<I extends Type<any>> extends TypeImpl<Reify<I>[]> {
  constructor(name: string, private readonly itemSchema: I) {
    super(name);
  }

  readonly validate = (u: unknown) => {
    if (!Array.isArray(u)) {
      throw new InvalidTypeError(this.name, 'array', u);
    }
    const result = [];
    for (const i of u) {
      result.push(this.itemSchema.validate(i));
    }
    return result;
  }
}
