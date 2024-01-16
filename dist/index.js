"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable brace-style */
/* eslint-disable n/handle-callback-err */
// Module Scope
const mongoose_1 = require("mongoose");
const extend_1 = __importDefault(require("extend"));
const package_json_1 = __importDefault(require("./package.json"));
const child_process_1 = require("child_process");
const startAt = (startAt) => startAt;
const incrementBy = (incrementBy) => incrementBy;
var colors;
(function (colors) {
    colors["Black"] = "\u001B[0;30m";
    colors["Red"] = "\u001B[0;31m";
    colors["Green"] = "\u001B[0;32m";
    colors["Orange"] = "\u001B[0;33m";
    colors["Blue"] = "\u001B[0;34m";
    colors["Purple"] = "\u001B[0;35m";
    colors["Cyan"] = "\u001B[0;36m";
    colors["LightGray"] = "\u001B[0;37m";
    colors["DarkGray"] = "\u001B[1;30m";
    colors["LightRed"] = "\u001B[1;31m";
    colors["LightGreen"] = "\u001B[1;32m";
    colors["Yellow"] = "\u001B[1;33m";
    colors["LightBlue"] = "\u001B[1;34m";
    colors["LightPurple"] = "\u001B[1;35m";
    colors["LightCyan"] = "\u001B[1;36m";
    colors["White"] = "\u001B[1;37m";
    colors["Clear"] = "\u001B[0m";
})(colors || (colors = {}));
let counterSchema;
let IdentityCounter;
const version = package_json_1.default.version;
const moduleName = package_json_1.default.name;
const templateVersion = (version) => `
  ${colors.Green}${'-'.repeat(66)}
  ${colors.Green}|${' '.repeat(64)}|
  ${colors.Green}|${' '.repeat(21)}${colors.LightBlue}There is a new Version${' '.repeat(21)}${colors.Green}|
  ${colors.Green}|${' '.repeat(24)}${colors.Purple}Available: ${version}${' '.repeat(23)} ${colors.Green}|
  ${colors.Green}|${' '.repeat(20)}${colors.Cyan}Click below to redirect:${' '.repeat(20)}${colors.Green}|
  ${colors.Green}|${' '.repeat(2)}${colors.Yellow}https://www.npmjs.com/package/@alec016/mongoose-autoincrement${colors.Green} |
  ${colors.Green}|${' '.repeat(64)}|
  ${colors.Green}${'-'.repeat(66)}${colors.Clear}
`;
const templateError = (method, error) => `
  ${colors.Red}${'-'.repeat(40)}
  |${' '.repeat(38)}|
  |${' '.repeat(5)}There is an Error on: ${method}${' '.repeat(5)}|
  |${' '.repeat(4)}Caused by: ${error}${' '.repeat(4)}|
  |${' '.repeat(38)}|
  ${'-'.repeat(40)}${colors.Clear}
`;
const templateVersionMatch = () => `
  ${colors.Green}${'-'.repeat(37)}
  |${' '.repeat(35)}|
  |${colors.White}    You have the latest Version    ${colors.Green}|
  |${colors.White}     of mongoose-autoincrement     ${colors.Green}|
  |${' '.repeat(35)}|
  ${'-'.repeat(37)}${colors.Clear}
`;
// Initialize plugin by creating counter collection in database.
const initialize = function (connection) {
    (0, child_process_1.exec)(`npm view ${moduleName} version`, (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`error: ${stderr}`);
            return;
        }
        stdout = stdout.replaceAll('\n', '');
        if (version < stdout) {
            console.log(templateVersion(stdout));
        }
        else {
            console.log(templateVersionMatch());
        }
    });
    try {
        IdentityCounter = connection.model('IdentityCounter');
    }
    catch (ex) {
        if (ex.name === 'MissingSchemaError') {
            // Create new counter schema.
            counterSchema = new mongoose_1.Schema({
                model: { type: String, require: true },
                field: { type: String, require: true },
                count: { type: Number, default: 0 }
            });
            // Create a unique index using the "field" and "model" fields.
            counterSchema.index({ field: 1, model: 1 });
            // Create model using new schema.
            IdentityCounter = connection.model('IdentityCounter', counterSchema);
        }
        else
            throw ex;
    }
};
// The function to use when invoking the plugin on a custom schema.
const plugin = async function (schema, options) {
    // If we don't have reference to the counterSchema or the IdentityCounter model then the plugin was most likely not
    // initialized properly so throw an error.
    if (!counterSchema || !IdentityCounter) {
        throw new Error('Mongoose autoIncrement must be initialized');
    }
    // Default settings and plugin scope variables.
    const settings = {
        model: undefined, // The model to configure the plugin for.
        field: `id`, // The field the plugin should track.
        startAt: startAt(0), // The number the count should start at.
        incrementBy: incrementBy(1), // The number by which to increment the count each time.
        unique: true // Should we create a unique index for the field
    };
    const fields = {}; // A hash of fields to add properties to in Mongoose.
    switch (typeof options) {
        // If string, the user chose to pass in just the model name.
        case 'string':
            settings.model = options;
            break;
        // If object, the user passed in a hash of options.
        case 'object':
            (0, extend_1.default)(settings, options);
            break;
    }
    if (settings.model == null)
        throw new Error('model must be set');
    const field = settings.field;
    // Add properties for field in schema.
    fields[field] = {
        type: Number,
        require: true
    };
    if (settings.field !== `id`)
        fields[field].unique = settings.unique;
    schema.add(fields);
    // Find the counter for this model and the relevant field.
    IdentityCounter.findOne({ model: settings.model, field: settings.field }).exec().then(function (counter) {
        if (!counter) {
            // If no counter exists then create one and save it.
            counter = new IdentityCounter({
                model: settings.model,
                field: settings.field,
                count: settings.startAt - settings.incrementBy
            });
            counter.save();
        }
    }).catch(function (err) { console.log(err); });
    // Declare a function to get the next counter for the model/schema.
    const nextCount = function (callback) {
        try {
            IdentityCounter.findOne({
                model: settings.model,
                field: settings.field
            }).exec().then(function (counter) {
                callback(null, counter === null
                    ? settings.startAt
                    : counter.count + settings.incrementBy);
            });
        }
        catch (e) {
            callback(e);
        }
    };
    // Add nextCount as both a method on documents and a static on the schema for convenience.
    schema.method('nextCount', nextCount);
    schema.static('nextCount', nextCount);
    // Declare a function to reset counter at the start value - increment value.
    const resetCount = function (callback) {
        try {
            IdentityCounter.findOneAndUpdate({ model: settings.model, field: settings.field }, { count: settings.startAt - settings.incrementBy }, { new: true } // new: true specifies that the callback should get the updated counter.
            ).exec().then(function () {
                callback(null, settings.startAt);
            });
        }
        catch (e) {
            callback(e);
        }
    };
    // Add resetCount as both a method on documents and a static on the schema for convenience.
    schema.method('resetCount', resetCount);
    schema.static('resetCount', resetCount);
    // Every time documents in this schema are saved, run this logic.
    schema.pre('save', function (next) {
        const doc = this;
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
                    { count: doc[settings.field] }).exec().then(function () { next(); });
                    // Continue with default document save functionality.
                }
                else {
                    // Find the counter collection entry for this model and field and update it.
                    IdentityCounter.findOneAndUpdate(
                    // IdentityCounter documents are identified by the model and field that the plugin was invoked for.
                    { model: settings.model, field: settings.field }, 
                    // Increment the count by `incrementBy`.
                    { $inc: { count: settings.incrementBy } }, 
                    // new:true specifies that the callback should get the counter AFTER it is updated (incremented).
                    { new: true }).exec().then(function (updatedIdentityCounter) {
                        // If there are no errors then go ahead and set the document's field to the current count.
                        doc[settings.field] = updatedIdentityCounter?.count;
                        // Continue with default document save functionality.
                        next();
                    });
                }
            }
            catch (err) {
                next(err);
            }
            // If not ready then set a 5 millisecond timer and try to save again. It will keep doing this until
            // the counter collection is ready.
        }
        else
            next();
        // If the document does not have the field we're interested in or that field isn't a number AND the user did
        // not specify that we should increment on updates, then just continue the save without any increment logic.
    });
};
const autoIncrement = {
    initialize,
    plugin,
    colors,
    templateError,
    startAt,
    incrementBy
};
module.exports = autoIncrement;
