'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {}
if(process.env.NODE_ENV === 'production'){
  options.schema = process.env.SCHEMA
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:'unique_tag',
        references:{
          model:'Spots'
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:'unique_key',
        references:{
          model:'Users'
        }
      },
      stars: {
        type:Sequelize.INTEGER(1),
        allowNull:false,
      },
      review: {
          type: Sequelize.STRING,
          allowNull:false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:new Date()
      }
    },{
      uniqueKeys:{
        unique_tag:{
          customIndex:true,
          fields:['spotId','userId']
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.dropTable(options);
  }
};