const HttpStatusCode = require('http-status-codes')
var validate = require('validator');
var dbConnection = require('../../../utilities/postgresql-connection.js');
var carUtils = require('../../../utilities/car-utils')

exports.createCar = (req, res) => {
    const entityData = {
        Name: req.body.Name,
        modelName: req.body.modelName,
        makeName: req.body.makeName
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

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            })
        })
    }

    function createCar(req, entityData) {
        return new Promise(async (resolve, reject) => {
            let isExist = await carUtils.carExists(entityData.Name)
            if (isExist)
                return resolve({
                    status: HttpStatusCode.StatusCodes.OK,
                    message: "Car already exists"
                })
            else {
                let modelId = await carUtils.getCarModel(entityData.modelName)
                let makeId = await carUtils.getCarMake(entityData.makeName)
                let query = `INSERT INTO car ("Name",makeid,modelid) VALUES ('${entityData.Name}',${makeId},${modelId}) RETURNING id`
                dbConnection.getResult(query).then(result => {
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        message: 'Car added sucessfully'
                    })
                })
            }
        })
    }

    validateFields(req, res).then(response => {
        createCar(req, response.data).then(response => {
            res.status(response.status).json({
                data: response.data,
                message: response.message
            })
        }).catch(function (error) {
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