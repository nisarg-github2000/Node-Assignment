var dbConnection = require('./postgresql-connection');

exports.getCarModel = async (modelName) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT id,"modelName" from model where LOWER("modelName")=LOWER('${modelName}')`
        dbConnection.getResult(query)
            .then(result => {
                if (result.data.length > 0)
                    return resolve(result.data[0].id)
                else {
                    query = `INSERT INTO model("modelName") VALUES('${modelName}') RETURNING id`
                    dbConnection.getResult(query).then(result => {
                        return resolve(result.data[0].id)
                    })
                }
            })
    });
}

exports.getCarMake = async (makeName) => {
    return new Promise((resolve, reject) => {
        let query = `Select id from make where LOWER(make."makeName")=LOWER('${makeName}')`
        dbConnection.getResult(query)
            .then(result => {
                if (result.data.length > 0)
                    return resolve(result.data[0].id)

                else {
                    dbConnection.getResult(`INSERT INTO make("makeName") VALUES('${makeName}') RETURNING id`)
                        .then(result => {
                            return resolve(result.data[0].id)
                        })
                }
            })
    });
}

exports.carExists = async (Name) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT car."Name" from car where LOWER(car."Name")=LOWER('${Name}')`
        dbConnection.getResult(query).then(result => {
            return resolve(result.data.length > 0)
        })
    });
}