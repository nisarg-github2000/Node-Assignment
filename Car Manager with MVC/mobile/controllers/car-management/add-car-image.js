const HttpStatusCode = require('http-status-codes')
var validate = require('validator');
var dbConnection = require('../../../utilities/postgresql-connection.js');
const fs = require('fs')

exports.addCarImage = (req, res) => {
    var entityData = {
        Id: req.params.id
    };

    function validateFields(req, res) {
        return new Promise(function (resolve, reject) {
            if (!req.file) {
                return resolve({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('ImageNotFound')
                });
            }
            var isCarIdEmpty = validate.isEmpty(entityData.Id);
            if (isCarIdEmpty) {
                return resolve({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdRequired')
                });
            }

            var isCarIdValid = validate.isInt(entityData.Id)

            if (!isCarIdValid) {
                fs.unlink(req.file.path, (err) => { if (err) console.log(err) })
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdInvalid')
                })
            }
            let id = parseInt(entityData.Id)
            if (id < 1) {
                fs.unlink(req.file.path, (err) => { if (err) console.log(err) })
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdPositive')
                })
            }

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            });
        });
    }

    function addCarImage(req, entityData) {
        return new Promise((resolve, reject) => {
            let query = `SELECT id FROM car WHERE id=${parseInt(entityData.Id)}`
            dbConnection.getResult(query)//await pool.query('SELECT id FROM car WHERE id=$1', [id])
                .then(result => {
                    if (result.data.length > 0) {
                        let query = "INSERT INTO carimage(imagename, createddate, carid) VALUES ('" + req.file.filename + "','" + new Date().toISOString() + "'," + parseInt(entityData.Id)  + ")"
                        dbConnection.getResult(query)
                            .then(result => {
                                return resolve({
                                    status: HttpStatusCode.StatusCodes.OK,
                                    data: result,
                                    message: 'Record listed successfully!!!'
                                });
                            })
                    }
                    else {
                        fs.unlink(req.file.path, (err) => { if (err) console.log(err) })
                        return resolve({
                            status: HttpStatusCode.StatusCodes.OK,
                            message: `No car with id:${entityData.Id}`
                        })
                    }
                }).catch(function (error) {
                    res.status(error.status).json({
                        data: error.data
                    });
                });
        })
    }

    validateFields(req, res).then(function (response) {
        addCarImage(req, response.data).then(function (response) {
            res.status(response.status).json({
                data: response.data,
                message: response.message
            });
        })
            .catch(function (error) {
                res.status(error.status).json({
                    data: error.data
                });
            });
    })
        .catch(function (error) {
            res.status(error.status).json({
                data: error.data,
                result: error.result
            });
        });

}