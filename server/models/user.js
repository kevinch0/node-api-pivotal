//need to add extra fields

const bcrypt = require('bcrypt'); 
const config = require('../config/general');

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isLowercase: true,
				notEmpty: true,
				isEmail: true
			}
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isLowercase: true,
				notEmpty: true,
				min: 3
			}
		},
		salt: {
			type: DataTypes.STRING,
			allowNull: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		sign_in_count: {
			type: DataTypes.INTEGER,
			// allowNull: false,			
			defaultValue: 0
		},
		current_sign_in_at: {
			type: DataTypes.DATE,
			// allowNull: false		
		},
		last_sign_in_at: {
			type: DataTypes.DATE,
			// allowNull: false		
		},
		current_sign_in_ip: {
			type: DataTypes.STRING,
			// allowNull: false		
		},
		last_sign_in_ip: {
			type: DataTypes.STRING,
			// allowNull: false		
		}
	}, {
		// schema: 'admin',
		classMethods: {
			validPassword: (password, passwd, done) => {
				const tmppass = password + config.secret;
				bcrypt.compare(tmppass, passwd, (err, isMatch) => {
					if (err) return done(err);
					done(null, isMatch);
				});
			},
			associate: (models) => {
				User.hasMany(models.Event, { foreignKey: 'user_id', as : 'userEvents' });
				User.hasOne(models.Detail, { foreignKey: 'user_id', as : 'UserDetails' });
			}
		}
	});

	User.beforeCreate( (user, options, done) => {
		bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
			if (err) return done(err);
			const tmppass = user.password + config.secret;
			bcrypt.hash(tmppass, salt, (err, hash) => {
				if (err) return done(err);
				user.salt 		= salt;
				user.password 	= hash;
				return done(null, user);
			});
		});
	});

	User.beforeUpdate( (user, options, done) => {
		bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
			if (err) return done(err);
			const tmppass = user.password + config.secret;
			bcrypt.hash(tmppass, salt, (err, hash) => {
				if (err) return done(err);
				user.salt 		= salt;
				user.password 	= hash;
				return done(null, user);
			});
		});
	});

	return User;
}; 