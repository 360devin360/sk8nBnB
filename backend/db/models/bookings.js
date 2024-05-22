'use strict';
const{Model} = require('sequelize');
const { Sequelize } = require('.');

module.exports = (sequelize, Datatype) => {
    // async function dateCheck(value){
    //     const booking = await Booking.findAll()
    //     throw new Error
    // }
    class Booking extends Model{
        static associate(models){
            
        };
    }
    Booking.init({
        userId:{
            type:Datatype.INTEGER,
            allowNull:false,
            references:{
                model:'Users'
            }
        },
        spotId:{
            type:Datatype.INTEGER,
            allowNull:false,
            references:{
                model:'Spots'
            }
        },
        startDate:{
            type:Datatype.DATE,
            allowNull:false,
            validate:{
                isAfter:new Date().toISOString().split('T')[0],
                isBefore(value){
                    if(value>=this.endDate){
                        throw new Error('endDate cannot be on or before startDate')
                    }
                }
            }
        },
        endDate:{
            type:Datatype.DATE,
            allowNull:false,
            validate:{
                isAfter(value){
                    if(value<=this.startDate){
                        throw new Error('endDate cannot be on or before startdate')
                    }
                }
            }
        },
    },{
        sequelize,
        modelName:'Booking',
    });
  
    return Booking;
};