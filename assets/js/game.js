  //Pulls questions and choices
  const question = document.getElementById("question");
  //Gets an array of the choices
  const choices = Array.from(document.getElementsByClassName("choice-text"));
  //Player score counter
  const questionCounterText = document.getElementById("question-counter");
  const scoreText = document.getElementById("score");
  //Loader
  const loader = document.getElementById('loader');
  const play = document.getElementById('play');

  // Default Variables
  let currentQuestion = {};
  let acceptingAnswers = false; //the user can not answer before it is ready
  let score = 0;
  let questionCounter = 0;
  let availableQuestions = [];
  let url = 'https://opentdb.com';

  //Fetch questions from API
  let questions = [];

  //CONSTANTS
  //How much its worth when getting an answer correct
  const CorrectBonus = 10;
  //How many questions a user gets before they finish
  const MaxQuestions = 10;

  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.href.includes('easy')) {
      url = 'https://opentdb.com/api.php?amount=10&category=15&difficulty=easy&type=multiple';
    } else if (window.location.href.includes('medium')) {
      //Fetch medium questions from API
      url = 'https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple';
    } else {
      //Fetch hard questions from API
      url = 'https://opentdb.com/api.php?amount=10&category=15&difficulty=hard&type=multiple';
    }
    fetchQuestionsFromAPI()
  })

  /**
   * Loads the questions
   * Get questions from opentdb
   */
  function fetchQuestionsFromAPI() {
    fetch(url)
      .then((res) => {
        return res.json(); //Return promise
      })
      .then((loadedQuestions) => {
        questions = loadedQuestions.results.map((loadedQuestion) => {
          const formattedQuestion = {
            question: loadedQuestion.question,
          };

          const answerChoices = [...loadedQuestion.incorrect_answers];
          formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
          answerChoices.splice(
            formattedQuestion.answer - 1,
            0,
            loadedQuestion.correct_answer
          );

          answerChoices.forEach((choice, index) => {
            formattedQuestion['choice' + (index + 1)] = choice;
          });

          return formattedQuestion;
        });
        if (questionCounterText) {
          startGame();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err) {
          setTimeout(() => {
            fetchQuestionsFromAPI()
          }, 6000)
        }
        //redirecting to 404 page if API request fails
        //window.location.replace("./404.html");
      });
    }
  /**
   * Start the game at 0, copy the questions from questions array
   * and they are put into a new array
   */
  function startGame() {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();

    //To show and hide the loader or the game
    play.classList.remove('hidden'); //shows the game
    loader.classList.add('hidden'); //removes the loader
  }

  /**
   * This function gets New Questions based on the length of the array
   * Grabs the choice property and get data attribute number to get the appropriate question
   * Questions and choices are populated
   */
  function getNewQuestion() {

    //if there are no questions left in the array or question counter gets to max
    if (availableQuestions.length === 0 || questionCounter >= MaxQuestions) {
      //go to the end html page
      return window.location.assign("./end.html");
    }
    questionCounter++;
    questionCounterText.innerHTML = `${questionCounter}/${MaxQuestions}`; //Scoreboard - question counter
    localStorage.setItem("mostRecentScore", score); //Stores scores

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerHTML = currentQuestion.question;

    choices.forEach(choice => {
      const number = choice.dataset.number;
      choice.innerHTML = currentQuestion["choice" + number];
    });

    availableQuestions.splice(questionIndex, 1); //the questions are not repeated
    acceptingAnswers = true; //allow user to answer
  }

  /**
   * Fetch the choices as the user clicks
   * allows to select and answer
   */
  choices.forEach(choice => {
    // e is the event (an answer button being clicked)
    choice.addEventListener("click", e => {
      const selectedChoice = e.target;
      const selectedAnswer = selectedChoice.dataset.number;
      //Detects correct and incorrect answers
      //Set class to apply according answer correct or not
      const classToApply = selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

      //Adds correct answer bonus
      if (classToApply === "correct") {
        incrementScore(CorrectBonus);
      }

      if (!acceptingAnswers) return;

      acceptingAnswers = false;

      //The selected choice grabs the parent element and get the class to apply
      selectedChoice.parentElement.classList.add(classToApply);

      //Delays the question to control the time in showing the feedback colour
      setTimeout(() => {
        selectedChoice.parentElement.classList.remove(classToApply);
        getNewQuestion();
      }, 1000);
    });
  });

  /**
  * Score counter
* This function increments the score
* and it stores it in the local storage
  } */
  function incrementScore(num) {
    score += num;
    scoreText.innerHTML = score;
    localStorage.setItem("mostRecentScore", score); //Stores scores
  }