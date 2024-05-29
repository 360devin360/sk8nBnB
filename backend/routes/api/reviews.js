const router = require('express').Router();
const {requireAuth} = require('../../utils/auth');
const {Review, sequelize} = require('../../db/models');
const {ReviewImage} = require('../../db/models');
const {User} = require('../../db/models');
const {Spot} = require('../../db/models');
const {SpotImage} = require('../../db/models');
const {Sequelize, and} = require('sequelize');
const {check} = require('express-validator');
const {handleValidationErrors} = require('../../utils/validation');

const checkReviewImageInfo =[
    check('url')
        .exists({checkFalsy:true})
        .withMessage("Url cannot be null"),
    handleValidationErrors
]
const checkReviewInfo = [
    check('review')
        .exists({checkFalsy:true})
        .withMessage("Review text is required"),
    check('stars')
        .exists({checkFalsy:true})
        .withMessage("Stars must be an integer from 1 to 5")
        .isInt({min:1,max:5})
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
]
// get reviews for current
router
.get('/current',requireAuth,async (req,res,next)=>{
    // get reviews'
    try{
        // get all reviews by the current user (include user and spot info)
        const reviews = await Review.findAll({
           where:{
            userId:req.user.id
           },
           // include users table
           include:[{
                model:User,
                // get only id, firstName, and lastName from Users
                attributes:[
                    'id',
                    'firstName',
                    'lastName'
                ]
           },{
                // include spot
                model:Spot,
                // get all attributes except createdAt and updatedAt
                attributes:{
                    exclude:[
                        'createdAt',
                        'updatedAt'
                    ],
                },
           }]
        })
        // get preview images for spot
        const previewImage = await SpotImage.findAll()
        // creat empty object for images
        let previewImages = {}
        // iterate over previewImages
        previewImage.forEach(value=>{
            // create variable and assign it value to json
            let image = value.toJSON()
            // add image url to object
            previewImages[image.spotId] = image.url
        })
        // get all reviewImages
        const images = await ReviewImage.findAll()
        // create empty object
        let imageToReview = {}
        // iterate over images
        images.forEach(value=>{
            // create json for value
            let image = value.toJSON();
            // create another empty object
            let refinedImage = {}
            // add image id and url to object
            refinedImage.id = image.id
            refinedImage.url = image.url
            // if first object doesnt have key with reviewId add it with image as value in array
            if(!imageToReview[image.reviewId]){
                imageToReview[image.reviewId] = [refinedImage]
            // else push up image to array for reviewId
            }else{
                imageToReview[image.reviewId].push(refinedImage)
            }
        })
        // create new empty Reviews collection
        let Reviews = []
        // iterate over reviews
        reviews.forEach(value=>{
            // deconstruct review
            let review = value.toJSON()
            //  if previewImages has key with reviewId add it
            if(previewImages[review.spotId]){
                // create key value for final object previewImage
                review.Spot.previewImage = previewImages[review.spotId]
            }
            // create array for reviewImages
            review.ReviewImages = []
            // add review image based on id of imageToReview (it was the reviewId)
            if(imageToReview[review.id]){
                review.ReviewImages=imageToReview[review.id]
            }
            // push review to Reviews
            Reviews.push(review)
        })
        // return reviews
        return res.json({Reviews})
        
    }catch(error){
        next(error)
    }

})
// add image to review
.post('/:reviewId/images', requireAuth, checkReviewImageInfo,async(req,res,next)=>{
    // try catch
    try{
        // get review by id
        const review = await Review.findAll({
            // where id is equal to id in url
            where:{
                id:req.params.reviewId
            },
            // include ReviewImages
            include:{
                model:ReviewImage
            }
        })
        // iterate over review to get user id
        review.forEach(value=>{
            // create review variable
            let review = value.toJSON()
            if(req.user.id!==review.userId){
                let err = {}
            err.status = 403
            err.title = 'Unauthorized User'
            err.message = 'Forbidden'
            err.errors = {
                "message":"Unauthorized User requesting access",
                "error": "User requested to add an image to a review they do not own"
            }
            throw err
            }

        })
        // if no review throw error
        if(!review){
            // create error
            let err = {
                // add title
                title:'Resource not found',
                // add message
                message:"Review couldn't be found",
                // add status code
                status:404
            }
            // throw error
            throw err
        }
        // iterate over review (to count number of review images
        review.forEach(value=>{
            // deconstruct value
            let review = value.toJSON();
            // if reviewImages length is greater than or equal to 10 send error
            if(review.ReviewImages.length>=10){
                // create err
                let err = {
                    // give title
                    title:"Database Limit",
                    // create message
                    message:"Maximum number of images for this resource was reached",
                    // set status
                    status:403
                }
                // throw error
                throw err
            }
        })
        // if error was not thrown add image to review
        let reviewImage = await ReviewImage.create({
            reviewId:req.params.reviewId,
            ...req.query
        })
        // send response
        res.json({
            id:reviewImage.id,
            url:reviewImage.url
        })
    // catch any errors
    }catch(error){
        next(error)
    }
})
//edit review
.put('/:reviewId', requireAuth, checkReviewInfo, async (req,res,next)=>{
    try{
        // find review by id
        const review = await Review.findByPk(req.params.reviewId);
        // if no review then throw error
        if(!review){
            // create error object
            let err = {
                // add title
                title:"Resource not found",
                // add message
                message:"Review couldn't be found",
                // add status
                status:404
            }
            // throw error
            throw err
        }
        // change edit review
        review.review = req.query.review
        review.stars = req.query.stars
        await review.save()
        res.json(review)
    }catch(error){
        return next(error)
    }
})
router.get('')
module.exports = router;
