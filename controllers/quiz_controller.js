var models = require('../models/models.js');

//GET /quizes/question

exports.show = function(req, res) {
	models.Quiz.findAll().success(function(quiz)){
	
		res.render('quizes/question', { pregunta: quiz[0].pregunta});	
	})
};

//GET /quizes/answer

exports.answer = function(req, res) {
	models.Quiz.findAll().success(function(quiz)){
		if (req.query.respuesta === quiz[0].respuesta){
			res.render('quizes/answer', {respuesta: "Correcto"});
		} else {
			res.render('quizes/answer', {respuesta: "Incorrecto"});
		}
	})
};

exports.index = function(req, res){
models.Quiz.findAll().then(function(quizes)){
	
		res.render('quizes/index.ejs', { quizes: quizes});	
	})
};

