/**
 * TestController
 *
 */

class AbcController{

    async trySequelize(req:Request,res:Response){
     	let user = ModelsService.User;
     	//let x = await user.create({title:'a title'})
     	let x = await user.findAll();
     	console.log(x)
     	res.send({x:x});
    }
}

module.exports = new AbcController();