const HttpStatusCode = require('http-status-codes')
var validate = require('validator');
var dbConnection = require('../../../utilities/postgresql-connection.js');
var carUtils = require('../../../utilities/car-utils')

exports.updateCar = async (req, res) => {
    const entityData = {
        Name: req.body.Name,
        modelName: req.body.modelName,
        makeName: req.body.makeName,
        id: req.params.id
    }

    function validateFields(req, res) {
        return new Promise((resolve, reject) => {
            let isEmpty = validate.isEmpty(entityData.makeName)
            if (isEmpty) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n._("CarMakeRequired")
                })
            }
            isEmpty = validate.isEmpty(entityData.Name)
            if (isEmpty) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n._("CarNameRequired")
                })
            }

            isEmpty = validate.isEmpty(entityData.modelName)
            if (isEmpty) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n._("CarModelRequired")
                })
            }

            let isCarIdValid = validate.isInt(entityData.id)

            if (!isCarIdValid) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdInvalid')
                })
            }
            let id = parseInt(entityData.id)
            if (id < 1) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdPositive')
                })
            }
            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            })
        })
    }

    function updateCar(req, entityData) {
        return new Promise(async (resolve, reject) => {
            let query = 'SELECT id FROM car WHERE id=' + entityData.id;
            let result = await dbConnection.getResult(query)
            if (result.data.length > 0) {
                let isExist = await carUtils.carExists(entityData.Name)
                if (isExist) {
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        result: `car already exist with name:${entityData.Name}`
                    })
                }
                else {
                    let modelId = await carUtils.getCarModel(entityData.modelName)
                    let makeId = await carUtils.getCarMake(entityData.makeName)
                    let query = `UPDATE car SET "Name"='${entityData.Name}', makeid=${makeId}, modelid=${modelId} WHERE id=${entityData.id}`
                    dbConnection.getResult(query).then(result => {
                        return resolve({
                            status: HttpStatusCode.StatusCodes.OK,
                            result: 'car updated successfully'
                        })
                    })
                }
            } else {
                return resolve({
                    status: HttpStatusCode.StatusCodes.OK,
                    result: `No car with id:${entityData.id}`
                })
            }
        })
    }

    validateFields(req, res).then((response) => {
        updateCar(req, response.data).then(function (response) {
            res.status(response.status).json({
                data: response.data,
                message: response.result
            });
        })
            .catch(function (error) {
                res.status(error.status).json({
                    data: error.data
                });
            });
    }).catch(error => {
        res.status(error.status).json({
            data: error.data,
            result: error.result
        });
    })
}