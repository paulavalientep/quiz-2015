var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};




//AUTOLOAD factoriza el código si la ruta incluye    :quizId
exports.load = function(req, res, next, quizId){
  models.Quiz.find({
    where: { id: Number(quizId)},
    include: [{ model: models.Comment}]
  }).then(function(quiz) {
  if (quiz) {
    req.quiz = quiz;
    next();
  } else{next(new Error('No existe quizId=' + quizId))}
 }
).catch(function(error){next(error);
});
};

//GET /quizes

exports.index = function(req, res){
   if(req.query.search === undefined) {
    models.Quiz.findAll().then(function(quizes) {
    res.render('quizes/index.ejs', {quizes: quizes, errors:[]});
  }
  ).catch(function(error){next(error)});
  } else {
    models.Quiz.findAll({order:["pregunta"] ,where: ["pregunta like ?",'%'+req.query.search+'%']}).then(function(quizes){
    res.render('quizes/index.ejs', {quizes: quizes, errors:[]});
  }
  ).catch(function(error){next(error);
});
};
  
};

//GET /quizes/:id

exports.show = function(req, res) {
    res.render('quizes/show', { quiz: req.quiz, errors:[]});  
};

//GET /quizes/:id/answer

exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta){
      resultado = 'Correcto';
    }
  res.render('quizes/answer', {quiz:req.quiz, respuesta: resultado, errors:[]});
  
};

//GET /quizes/new

exports.new = function(req, res) {
  var quiz = models.Quiz.build(//Crea objeto quiz
      { pregunta: "Pregunta", respuesta:"Respuesta"

      }
    );
  res.render('quizes/new', {quiz:quiz, errors:[]});
  
};

exports.create = function(req, res, next) {
  req.body.quiz.UserId = req.session.user.id;
  var quiz = models.Quiz.build(req.body.quiz);

  quiz.validate().then(
      function(err){
          if(err){ 
            res.render('quizes/new', {quiz: quiz, errors: err.errors});
              } else {
                quiz // save: guarda en DB campos pregunta y respuesta de quiz
                .save({fields: ["pregunta", "respuesta" , "UserId"]})
                .then( function(){ res.redirect('/quizes')}) 
              }      // res.redirect: Redirección HTTP a lista de preguntas
        }
    ).catch(function(error){next(error);
});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error);
});
};

// DELETE /quizes/:id
exports.destroy = function(req, res, next) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error);});
};


// GET /quizes/statistics 
exports.statistics = function(req, res) {
    models.Quiz.count().then(function(nQuizes) {
        models.Comment.count().then(function(nComments) {
            models.Quiz.findAll( {
               include: [{
                    model: models.Comment
                }]
            }).then(function(quizes) {
                var commentedQuizes = 0;
                for(i in quizes) {
                    if(quizes[i].Comments.length)
                        commentedQuizes++;
                }
                res.render('quizes/statistics', {
                    quizes         : nQuizes,
                    comments       : nComments,
                    commentedQuizes: commentedQuizes,
                    errors: []
                });
            });
        });
    });
};


