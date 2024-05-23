const router = require('express').Router();
const {Spot} = require('../../db/models');
const {Sequelize} = require('sequelize');
const {Review} = require('../../db/models');
const {SpotImage} = require('../../db/models');
const {requireAuth} = require('../../utils/auth')
const {User} = require('../../db/models')
const {handleValidationErrors} = require('../../utils/validation');
const {check} = require('express-validator')

const validateSpotInfo = [
    check('address')
        .exists({checkFalsy:true})
        .withMessage('Street address is required'),
    check('city')
        .exists({checkFalsy:true})
        .withMessage('City is required'),
    check('state')
        .exists({checkFalsy:true})
        .withMessage('State is required'),
    check('country')
        .exists({checkFalsy:true})
        .withMessage('Country is required'),
    check('lat')
        .optional({nullable:true})
        .isFloat()
        .withMessage('Latitude is not valid'),
    check('lng')
        .optional({nullable:true})
        .isFloat()
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({values:'falsy'})
        .isLength({max:50})
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({value:'falsy'})
        .withMessage('Description is required'),
    check('price')
        .exists({options:'falsy'})
        .withMessage('Price per day is required'),
    handleValidationErrors
]

router
.get('/current', requireAuth, async(req,res,next)=>{
    try{
        const spots = await Spot.findAll({
            attributes: {
                include:[
                    [Sequelize.fn('AVG',Sequelize.col('Reviews.stars')),'avgRating'],
                    [Sequelize.fn('',Sequelize.col('SpotImages.url')),'previewImage']
                ],
            },
            where:{ownerId:req.user.id},
            group:['Spot.id'],
            include:[{
                model:Review,
                attributes:[]
            },{
                model:SpotImage,
                attributes:[],
            }]
        })
        res.json({spots})
    }catch(error){
        next(error)
    }
})

.get('/:spotId',async (req,res,next)=>{
    try{
        const spots = await Spot.findAll({
            attributes: {
                include:[
                    [Sequelize.fn('AVG',Sequelize.col('Reviews.stars')),'avgRating'],
                ],
            },
            where:{
                id:req.params.spotId
            },
            group:['Spot.id'],
            include:[{
                model:Review,
                attributes:[]
            },{
                model:SpotImage,
                attributes:[
                    'id',
                    'url',
                    'preview'
                ],
            },{
                model:User,
                as:'Owner',
                attributes:[
                    'id',
                    'firstName',
                    'lastName'
                ]
            }]
        })
        if(!spots.length){
            let err = new Error("Spot couldn't be found")
            err.status = 404
            err.title = 'Resource not found'
            err.errors = {
                "query":"Query returned an empty array (no resources like that)"
            }
            throw err
        }
        res.json({spots})
    }catch(error){
        next(error)
    }
})

.get('/', async (req,res,next)=>{
    try{
    const spots = await Spot.findAll({
        attributes: {
            include:[
                [Sequelize.fn('AVG',Sequelize.col('Reviews.stars')),'avgRating'],
                [Sequelize.fn('',Sequelize.col('SpotImages.url')),'previewImage']
            ],
        },
        group:['Spot.id'],
        include:[{
            model:Review,
            attributes:[]
        },{
            model:SpotImage,
            attributes:[],
        }]
    })
    res.json({spots})
    }catch(error){
        next(error)
    }
})

.post('/', requireAuth, validateSpotInfo, async (req,res,next)=>{
    try{
        req.body.ownerId = req.user.id
        let created = await Spot.create({
            ownerId:req.user.id,
            ...req.body
        })
        const spot = await Spot.findByPk(created.id)
        res.status(201).json(spot)
    }catch(error){
        next(error)
    }
})


module.exports = router