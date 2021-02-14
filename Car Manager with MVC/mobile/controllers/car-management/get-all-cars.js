
var HttpStatusCode = require("http-status-codes");
var dbConnection = require('../../../utilities/postgresql-connection.js');
var config = require('../../../config')

exports.getAllCars = function (req, res) {
    var entityData = {};

    function validateFields(req, res) {
        return new Promise(function (resolve, reject) {

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            });
        });
    }

    function getAllCars(req, entityData) {
        return new Promise(function (resolve, reject) {
            const sqlQuery = 'SELECT c."Name" as "Car Name",m."makeName" as "Make",mo."modelName" as "Model",array_agg(img.imagename) images from car c left join make m on c.makeid=m.id left join model mo on c.modelid=mo.id left join carimage img on c.id=img.carid GROUP BY c.id,m."makeName",mo."modelName"';
            dbConnection.getResult(sqlQuery).then(function (response) {
                if (response.data.length > 0) {
                    response.data.forEach(car => {
                        let carImageDisplay = []
                        if (car.images[0] !== null) {
                            car.images.forEach(img => carImageDisplay.push(config.imagePath + img))
                            car.images = carImageDisplay
                        }
                    });
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        data: response,
                        message: 'Record listed successfully!!!'
                    });
                } else {
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        data: [],
                        message: 'No record found!!!'
                    });
                }
            })
                .catch(function (error) {
                    res.status(error.status).json({
                        data: error.data
                    });
                });
        });
    }

    validateFields(req, res).then(function (response) {
        getAllCars(req, response.data).then(function (response) {
            res.status(response.status).json({
                data: response.data.data,
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
                data: error.data
            });
        });

}