/* eslint-disable brace-style */
/* eslint-disable n/handle-callback-err */
// Module Scope
import {
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

import extend from 'extend'
import thiz from './package.json'
import { exec } from 'child_process'

type Integer<T extends number> = 
  number extends T ? never :
  `${T}` extends `${any}.${any}` ? never : T

type PositiveInteger<T extends number> = 
  number extends T ? never :
  `${T}` extends `-${any}` | `${any}.${any}` ? never : T

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
                            : T | typeof SchemaType | Schema<any, any, any> | SchemaDefinition<T> | Function | AnyArray<Function>;

type Field<T = undefined> = {
  type: Type<T>
  require: boolean,
  unique?: boolean
}

type Fields = {
  [field: string]: Field
}

interface AutoIncrementOptions<T extends number, K extends number> {
  model?: string,
  field: string,
  startAt: Integer<T>,
  incrementBy: PositiveIntegerWithOutZero<K>,
  unique?: boolean
}
const startAt = <T extends number>(startAt: Integer<T>): Integer<T> => startAt

const incrementBy = <T extends number>(incrementBy: PositiveIntegerWithOutZero<T>): PositiveIntegerWithOutZero<T> => incrementBy

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

let counterSchema: any
let IdentityCounter: any
const version = thiz.version
const moduleName: string = thiz.name

const templateVersion = (version: string) => `
  ${colors.Green}${'-'.repeat(66)}
  ${colors.Green}|${' '.repeat(64)}|
  ${colors.Green}|${' '.repeat(21)}${colors.LightBlue}There is a new Version${' '.repeat(21)}${colors.Green}|
  ${colors.Green}|${' '.repeat(24)}${colors.Purple}Available: ${version}${' '.repeat(23)} ${colors.Green}|
  ${colors.Green}|${' '.repeat(20)}${colors.Cyan}Click below to redirect:${' '.repeat(20)}${colors.Green}|
  ${colors.Green}|${' '.repeat(2)}${colors.Yellow}https://www.npmjs.com/package/@alec016/mongoose-autoincrement${colors.Green} |
  ${colors.Green}|${' '.repeat(64)}|
  ${colors.Green}${'-'.repeat(66)}${colors.Clear}
`
const templateError = (method: string, error: string) => `
  ${colors.Red}${'-'.repeat(40)}
  |${' '.repeat(38)}|
  |${' '.repeat(5)}There is an Error on: ${method}${' '.repeat(5)}|
  |${' '.repeat(4)}Caused by: ${error}${' '.repeat(4)}|
  |${' '.repeat(38)}|
  ${'-'.repeat(40)}${colors.Clear}
`

const templateVersionMatch = () => `
  ${colors.Green}${'-'.repeat(37)}
  |${' '.repeat(35)}|
  |${colors.White}    You have the latest Version    ${colors.Green}|
  |${colors.White}     of mongoose-autoincrement     ${colors.Green}|
  |${' '.repeat(35)}|
  ${'-'.repeat(37)}${colors.Clear}
`

// Initialize plugin by creating counter collection in database.
const initialize = function (connection: Connection) {
  exec(`npm view ${moduleName} version`, (error: any, stdout: any, stderr: any) => {
    if(error) {
      console.error(`error: ${error.message}`)
      return
    }
    if(stderr) {
      console.error(`error: ${stderr}`)
      return
    }
    stdout = stdout.replaceAll('\n', '')
    if (version < stdout) {
      console.log(templateVersion(stdout))
    } else {
      console.log(templateVersionMatch())
    }
  })
  try {
    IdentityCounter = connection.model('IdentityCounter')
  } catch (ex: any) {
    if (ex.name === 'MissingSchemaError') {
      // Create new counter schema.
      counterSchema = new Schema({
        model: { type: String, require: true },
        field: { type: String, require: true },
        count: { type: Number, default: 0 }
      })
      
      // Create a unique index using the "field" and "model" fields.
      counterSchema.index(
        { field: 1, model: 1 },
        { unique: true, required: true, index: -1 }
      )
      
      // Create model using new schema.
      IdentityCounter = connection.model('IdentityCounter', counterSchema)
    } else throw ex
  }
}

// The function to use when invoking the plugin on a custom schema.
const plugin = async function<T extends number, K extends number>(schema: Schema, options: AutoIncrementOptions<T, K> | string) {
  // If we don't have reference to the counterSchema or the IdentityCounter model then the plugin was most likely not
  // initialized properly so throw an error.
  if (!counterSchema || !IdentityCounter) { 
    throw new Error('Mongoose autoIncrement must be initialized')
  }

  // Default settings and plugin scope variables.
  const settings: AutoIncrementOptions<T, K> | AutoIncrementOptions<0 , 1> = {
    model: undefined, // The model to configure the plugin for.
    field: `_id`, // The field the plugin should track.
    startAt: startAt(0), // The number the count should start at.
    incrementBy: incrementBy(1), // The number by which to increment the count each time.
    unique: true // Should we create a unique index for the field
  }

  const fields: Fields = {} // A hash of fields to add properties to in Mongoose.
  
  switch (typeof options) {
    // If string, the user chose to pass in just the model name.
    case 'string':
      settings.model = options
      break
    // If object, the user passed in a hash of options.
    case 'object':
      extend(settings, options)
      break
  }

  if (settings.model == null) 
    throw new Error('model must be set')

  // Add properties for field in schema.
  fields[settings.field] = {
    type: Number,
    require: true
  }
  if (settings.field !== `id`) fields[settings.field].unique = settings.unique
  schema.add(fields)

  // Find the counter for this model and the relevant field.
  IdentityCounter.findOne(
    { model: settings.model, field: settings.field }
  ).then(function (counter: any) {
    if (!counter) {
      // If no counter exists then create one and save it.
      counter = new IdentityCounter({
        model: settings.model,
        field: settings.field,
        count: settings.startAt - settings.incrementBy
      })
      counter.save()
    }
  }).catch(function (err: any) { console.log(err) } )


  // Declare a function to get the next counter for the model/schema.
  const nextCount = function (callback: any) {
    try {
      IdentityCounter.findOne(
        {
          model: settings.model,
          field: settings.field
        }
      ).then(function (counter: any) {
        callback(
          null,
          counter === null
            ? settings.startAt
            : counter.count + settings.incrementBy
        )
      })
    } catch (e) {
      callback(e)
    }
  }
  // Add nextCount as both a method on documents and a static on the schema for convenience.
  schema.method('nextCount', nextCount)
  schema.static('nextCount', nextCount)

  // Declare a function to reset counter at the start value - increment value.
  const resetCount = function (callback: any) {
    try {
      IdentityCounter.findOneAndUpdate(
        { model: settings.model, field: settings.field },
        { count: settings.startAt - settings.incrementBy },
        { new: true } // new: true specifies that the callback should get the updated counter.
      ).then(function () {
        callback(null, settings.startAt)
      })
    } catch (e) {
      callback(e)
    }
  }
  // Add resetCount as both a method on documents and a static on the schema for convenience.
  schema.method('resetCount', resetCount)
  schema.static('resetCount', resetCount)

  // Every time documents in this schema are saved, run this logic.
  schema.pre('save', function (next) {
    const doc = this
    // Only do this if it is a new document (see http://mongoosejs.com/docs/api.html#document_Document-isNew)
    if (doc.isNew) {
      // Declare self-invoking save function.
      // If ready, run increment logic.
      // Note: ready is true when an existing counter collection is found or after it is created for the
      // first time.
      try {
      // check that a number has already been provided, and update the counter to that number if it is
      // greater than the current count
        if (typeof doc[settings.field] === 'number') {
          IdentityCounter.findOneAndUpdate(
            // IdentityCounter documents are identified by the model and field that the plugin was invoked for.
            // Check also that count is less than field value.
            {
              model: settings.model,
              field: settings.field,
              count: { $lt: doc[settings.field] }
            },
            // Change the count of the value found to the new field value.
            { count: doc[settings.field] }
          ).then(function () { next() })
          // Continue with default document save functionality.
        } else {
          // Find the counter collection entry for this model and field and update it.
          IdentityCounter.findOneAndUpdate(
            // IdentityCounter documents are identified by the model and field that the plugin was invoked for.
            { model: settings.model, field: settings.field },
            // Increment the count by `incrementBy`.
            { $inc: { count: settings.incrementBy } },
            // new:true specifies that the callback should get the counter AFTER it is updated (incremented).
            { new: true }
          ).then(function (updatedIdentityCounter: any) { 
            // If there are no errors then go ahead and set the document's field to the current count.
            doc[settings.field] = updatedIdentityCounter.count
            // Continue with default document save functionality.
            next()
          })
        }
      } catch (err) {
        next(err as Error)
      }
      // If not ready then set a 5 millisecond timer and try to save again. It will keep doing this until
      // the counter collection is ready.
    } else next()
    // If the document does not have the field we're interested in or that field isn't a number AND the user did
    // not specify that we should increment on updates, then just continue the save without any increment logic.
  })
}

const autoIncrement = {
  initialize,
  plugin,
  colors,
  templateError
}

module.exports = autoIncrement