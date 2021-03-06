const User 		= require('../models').User;
const passport 	= require('passport');
const jwt 		= require('jsonwebtoken');
const config	= require('../config/general');

module.exports = {
	create(req, res){
		console.log(req);
		return User
			.find({
				where: { $or: [{username: req.body.username}, {email: req.body.email}] }
			})
			.then(user => {
				if (!user) {
					User.create({
						email 	: req.body.email,
						username: req.body.username,
						password: req.body.password
					})
					.then(user => res.status(200).send(user));
				}
				else {
					return res.status(400).send({message: 'Username / Email is Already Exist'});
				}
			})
			.catch(error => res.status(400).send(error));
	},
	login(req, res, next) {
		passport.authenticate('local', (err, user, info) => {
			if (err) {
				return next(err);
			}

			if (!user) {
				return res.status(401).send({message: 'authentication failed'});
			}

			req.login(user, (err) => {
				if (err) return next(err);

				const token = jwt.sign({ user: user.id }, config.secret, {expiresIn: 24 * 60 * 60});
				return res.status(200).send({
					token 	: token,
					userId	: user.id,
					username: user.username
				});
			});
		})(req, res, next);
	},
	profile(req, res, next) {
		console.log(req);		
		return User
			.findById(req.params.userId)
			.then(user => {
				if (!user) {
					return res.status(400).send({success: false, message: 'User not Found'});
				}
				
				const data = {
					id: user.id,
					username: user.username,
					email: user.email
				}
				return res.status(200).send(data);

			})
			.catch(error => res.status(400).send(error));
	}
};