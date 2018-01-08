/**
 * Modelsservice Service
 *
 */

import {Model} from "sequelize";
var models  = require('../models');

export class Modelsservice{
	
	
    get User():Model<{},{}>{
      return  models.User;
    }
    
    //<models here>
      
}

module.exports = new Modelsservice();