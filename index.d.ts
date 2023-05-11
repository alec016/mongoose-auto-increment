// Type definitions for @alec016/mongoose-autoincrement 1.3.1
// Minimum TypeScript Version: 5

declare module '@alec016/mongoose-autoincrement' {
  /**
  * Type importation
  */
  import type {
    Schema,
    Connection,
    SchemaTypeOptions,
    SchemaType,
    AnyArray,
    BooleanSchemaDefinition,
    DateSchemaDefinition,
    NumberSchemaDefinition,
    ObjectId,
    ObjectIdSchemaDefinition,
    SchemaDefinition,
    StringSchemaDefinition,
    Types,
    Unpacked
  } from 'mongoose'

  /**
   * Type definition for Integer numbers ( no decimals )
   */
  type Integer<T extends number> = 
    number extends T ? never :
    `${T}` extends `${any}.${any}` ? never : T

  /**
   * Type definition for non negative Integers
   */
  type PositiveInteger<T extends number> = 
    number extends T ? never :
    `${T}` extends `-${any}` | `${any}.${any}` ? never : T

  /**
   * Type definition for non negative Integers without zero
   */
  type PositiveIntegerWithOutZero<T extends number> =
    number extends T ? never :
    `${T}` extends '0' | `-${any}` | `${any}.${any}` ? never : T

  /**
   * Type definition for Schema type Fields
   */
  type Type<T> = 
    T extends string 
      ? StringSchemaDefinition 
      : T extends number 
        ? NumberSchemaDefinition 
        : T extends boolean 
          ? BooleanSchemaDefinition 
          : T extends NativeDate 
            ? DateSchemaDefinition 
            : T extends Map<any, any> 
              ? SchemaDefinition<typeof Map> 
              : T extends Buffer 
                ? SchemaDefinition<typeof Buffer> 
                : T extends Types.ObjectId 
                  ? ObjectIdSchemaDefinition 
                  : T extends Types.ObjectId[] 
                    ? AnyArray<ObjectIdSchemaDefinition> | AnyArray<SchemaTypeOptions<ObjectId>> 
                    : T extends object[] 
                      ? (AnyArray<Schema<any, any, any>> | AnyArray<SchemaDefinition<Unpacked<T>>> | AnyArray<SchemaTypeOptions<Unpacked<T>>>) 
                      : T extends string[] 
                        ? AnyArray<StringSchemaDefinition> | AnyArray<SchemaTypeOptions<string>> 
                        : T extends number[] 
                          ? AnyArray<NumberSchemaDefinition> | AnyArray<SchemaTypeOptions<number>> 
                          : T extends boolean[] 
                            ? AnyArray<BooleanSchemaDefinition> | AnyArray<SchemaTypeOptions<boolean>> 
                            : T extends Function[] 
                              ? AnyArray<Function | string> | AnyArray<SchemaTypeOptions<Unpacked<T>>> 
                              : T | SchemaType | Schema<any, any, any> | SchemaDefinition<T> | Function | AnyArray<Function>;

  /**
  * Type definition for each field in Fields hash
  */
  type Field<T = undefined> = {
    type: Type<T>
    require: boolean,
    unique?: boolean
  }

  /**
   * Type definition for Fields hash
   */
  type Fields = {
    [field: string]: Field
  }
  /**
   * Options type for plugin function
   *
   * @interface AutoIncrementOptions
   */
  interface AutoIncrementOptions<T extends number, K extends number> {
    model?: string,
    field: string,
    startAt: Integer<T>,
    incrementBy: PositiveIntegerWithOutZero<K>,
    unique?: boolean
  }

  /**
   * Type of Colorized String for console output
   *
   * @interface ColorizedString
   * @extends {String}
   */
  interface ColorizedString extends String {}


  /**
   * Colorize console output with this color codes
   * 
   * @enum {number}
   */
  enum colors {
    Black = '\x1B[0;30m',
    Red = '\x1B[0;31m',
    Green = '\x1B[0;32m',
    Orange = '\x1B[0;33m',
    Blue = '\x1B[0;34m',
    Purple = '\x1B[0;35m',
    Cyan = '\x1B[0;36m',
    LightGray = '\x1B[0;37m',
    DarkGray = '\x1B[1;30m',
    LightRed = '\x1B[1;31m',
    LightGreen = '\x1B[1;32m',
    Yellow = '\x1B[1;33m',
    LightBlue = '\x1B[1;34m',
    LightPurple = '\x1B[1;35m',
    LightCyan = '\x1B[1;36m',
    White = '\x1B[1;37m',
    Clear = '\x1B[0m'
  }

  /**
   * Initialize plugin by creating counter collection in database.
   *
   * @param {Connection} connection
   */
  function initialize(connection: Connection): void
  
  /**
   * The function to use when invoking the plugin on a custom schema.
   *
   * @template T
   * @template K
   * @param {Schema} schema
   * @param {(AutoIncrementOptions<T, K> | string)} options
   */
  function plugin<T extends number, K extends number>(schema: Schema, options: AutoIncrementOptions<T, K> | string): void

  /**
   * Default template Error with method and cause
   *
   * @param {string} [method='']
   * @param {string} [error='']
   * @return {*}  {ColorizedString}
   */
  function templateError(method: string, error: string): ColorizedString
  function templateVersion(version: string): ColorizedString

  function startAt<T extends number>(startAt: Integer<T>): Integer<T>
  
  function incrementBy<T extends number>(incrementBy: PositiveIntegerWithOutZero<T>): PositiveIntegerWithOutZero<T>
  
  enum autoIncrement { initialize, plugin, colors, templateError }
}
