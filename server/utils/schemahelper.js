// Iterate through an array of SchemaErrors
// get the names of the missing, wrong fields
// and return them.

const iterateSchemaErrors = (errors) => {
    let errorMessage = 'Missing Keys: \n'
    for (const error of errors){
        errorMessage += error.argument + "\n"
    }
    return errorMessage
}

module.exports = iterateSchemaErrors
