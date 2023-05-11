// Type definitions for @alec016/mongoose-autoincrement 1.3.1
// Minimum TypeScript Version: 5

declare module '@alec016/mongoose-autoincrement' {
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
  
  type Field<T = undefined> = {
    type: Type<T>
    require: boolean,
    unique?: boolean
  }
  
  type Fields = {
    [field: string]: Field
  }
  /**
   * Options type for plugin function
   *
   * @interface AutoIncrementOptions
   */
  interface AutoIncrementOptions {
    model?: String,
    field?: String,
    startAt?: Integer<any>,
    incrementBy?: PositiveIntegerWithOutZero<any>,
    unique?: Boolean
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
    Black = '\033[0;30m',
    Red = '\033[0;31m',
    Green = '\033[0;32m',
    Orange = '\033[0;33m',
    Blue = '\033[0;34m',
    Purple = '\033[0;35m',
    Cyan = '\033[0;36m',
    LightGray = '\033[0;37m',
    DarkGray = '\033[1;30m',
    LightRed = '\033[1;31m',
    LightGreen = '\033[1;32m',
    Yellow = '\033[1;33m',
    LightBlue = '\033[1;34m',
    LightPurple = '\033[1;35m',
    LightCyan = '\033[1;36m',
    White = '\033[1;37m',
    Clear = '\033[0m'
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
   * @param {Schema} schema
   * @param {(AutoIncrementOptions | String)} options
   */
  function plugin(schema: Schema, options: AutoIncrementOptions | String): void

  /**
   * Default template Error with method and cause
   *
   * @param {String} [method='']
   * @param {String} [error='']
   * @return {*}  {ColorizedString}
   */
  function templateError(method?: String, error?: String): ColorizedString

  function startAt<T extends number>(startAt: Integer<T>): Integer<T>
  
  function incrementBy<T extends number>(incrementBy: PositiveIntegerWithOutZero<T>): PositiveIntegerWithOutZero<T>
  
  enum autoIncrement { initialize, plugin, colors, templateError }
}
