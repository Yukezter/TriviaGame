(function(){

    $(document).ready(function() {
        $('.main-heading').hide();
        $('#categories').hide();
        $('#game').hide();
        $('.main-heading').fadeIn(fadeTime, function() {
            $('.main-heading').fadeOut(fadeTime, function() {
                $('#categories').fadeIn(fadeTime);
            });
        });
    });

    // Game objects
    var session = {};
    var timer = {
        countDown: 60,
    };
    var fadeTime = 1000;

    // Timer functions
    function startTimer() {
        if (!timer.running) {
            timer.intervalId = setInterval(countTimer, 1000);
            timer.running = true;
        }
    }

    function countTimer() {
        timer.timeLeft--;
        $('#timer').text(timer.timeLeft);
        if (timer.timeLeft === 0) {
            $('#alert').text('Out of time!');
            session.incorrectAnswers++;
            timeoutAnswer();
        }
    }

    function stopTimer() {
        clearTimeout(timer.intervalId);
        timer.running = false;
    }

    function resetTimer() {
        timer.timeLeft = timer.countDown;
        $('#timer').text(timer.timeLeft);
    }

    // Game functions
    function initVariables() {
        session.correctAnswers = 0;
        session.incorrectAnswers = 0;
        session.questionNumber = 0;
        session.paused = false;

        timer.timeLeft = 60;
        timer.running = false;
    }

    function startGame() {
        $('#categories').fadeOut(fadeTime, function() {
            initVariables();
            nextQuestion();
            $('#game').fadeIn(fadeTime);
            session.paused = false;
        });
    }

    function nextQuestion() {
        if (session.category.clues.length > 0) {
            startTimer();
            var categoryLength = session.category.clues.length;
            session.randomIndex = Math.floor(Math.random() * categoryLength);
            session.questionObj = session.category.clues[session.randomIndex];
            session.questionNumber++;

            $('#alert').text('Question ' + session.questionNumber + ' of 20');
            $('#question').text(session.questionObj.question);
        }
    }

    function removeQuestion() {
        if (session.category.clues.length > 0) {
            session.category.clues.splice(session.randomIndex, 1);
            session.nextQuestion++;
        }
    }

    function checkAnswer(userAnswer) {

        // RegEx functions
        function removeChars(str) {
            var charsToReplace = /[\/\\"',\.]| &|& /g;
            str = str.replace(charsToReplace, '');
            str = str.replace(/-/g, ' ');
            return str;
        }

        function removeWords(str) {
            var wordsToReplace = /the | the|or | or|a | a/g;
            str = str.replace(/ *\([^)]*\) */g, '');
            str = str.toLowerCase().replace(wordsToReplace, '');
            return str;
        }

        function cleanAnswer(str) {
            var stuffToReplace = /<i>|<\/i>/g;
            str = str.replace(stuffToReplace, '');
            return str;
        }

        function wordsInParenthesis(str) {
            var parenthesis = /\(([^)]+)\)/;
            var matches = parenthesis.exec(str);
            return matches != null ? matches[1] : undefined;
        }

        session.questionObj.answer = cleanAnswer(session.questionObj.answer);
        var userAnswerOne = removeChars(userAnswer);
        var answerOne = removeChars(session.questionObj.answer);
        var userAnswerTwo = removeWords(userAnswerOne);
        var answerTwo = removeWords(answerOne);
        var answerThree = wordsInParenthesis(answerOne);

        if (userAnswerOne === answerOne) {
            $('#alert').text('Correct!');
            session.correctAnswers++;
        } else if (userAnswerTwo === answerTwo) {
            $('#alert').text('Correct!');
            session.correctAnswers++;
        } else if (userAnswerTwo === answerThree) {
            $('#alert').text('Correct!');
            session.correctAnswers++;
        } else {
            $('#alert').text('Incorrect!');
            session.incorrectAnswers++;
        }
        $('#user-answer').text(userAnswer);
        $('.user-answer').removeClass('d-none');
    }

    // Html updates
    function elementsBeforeTimeout() {
        $('#correct').text(session.correctAnswers);
        $('#incorrect').text(session.incorrectAnswers);
        $('#answer').text(session.questionObj.answer);
        $('.answer').removeClass('d-none');
        $('#answer-input').addClass('d-none');
        $('#answer-input').val('');
        $('.invalid').addClass('d-none');
        $('#submit-btn, #next-question-btn').addClass('disabled');
    }

    function elementsAfterTimeout() {
        $('.answer, .user-answer').addClass('d-none');
        $('#answer-input').removeClass('d-none');
        $('#submit-btn, #next-question-btn').removeClass('disabled');
    }

    function gameOver() {
        $('.main-heading').text('Game over.');
        $('#game').fadeOut(fadeTime, function() {
            resetTimer();
            $('#alert').text('Thanks for playing!');
            $('#question').text('');
            $('.answer, .user-answer').addClass('d-none');
            $('.invalid').addClass('d-none');
            $('#submit-btn, #next-question-btn').removeClass('disabled');
            $('#submit-btn, #next-question-btn').addClass('d-none');
            $('#restart-btn').removeClass('d-none');
            $('#time').addClass('d-none');
            $('.main-heading').fadeIn(fadeTime, function() {
                $('.main-heading').fadeOut(fadeTime, function() {
                    $('#game').fadeIn(fadeTime);
                });
            });
        });
    }

    function timeoutAnswer() {
        session.paused = true;
        stopTimer();

        elementsBeforeTimeout();

        setTimeout(function() {
            removeQuestion();
            if (session.questionNumber === 20) {
                gameOver();
            } else {
                resetTimer();
                nextQuestion();
                elementsAfterTimeout();
                session.paused = false;
            }
        }, 5000);
    }

    // Click events
    $('.category').on('click', function() {

        if (!session.paused) {
            session.paused = true;
            var categoryId = $(this).val();
            var urlQuery = 'https://cors-anywhere.herokuapp.com/http://jservice.io/api/category?id=' + categoryId;
        
            $.ajax({
                url: urlQuery,
                method: 'GET',
                type: 'json',
            }).then(function(res) {
                session.category = res;
                // One of the sports answers is wrong
                if (session.category.title === 'sports') {
                    session.category.clues[29].answer = 'ole';
                }
                startGame();
            }).fail(function() {

            });
        }
    });

    $('#submit-btn').on('click', function() {
        if (!session.paused) {
            var userAnswer = $('#answer-input').val().trim();
            if (userAnswer != '') {
                checkAnswer(userAnswer);
                timeoutAnswer();
            } else {
                $('#answer-input').val('');
                $('.invalid').removeClass('d-none');
            }
        }
    });

    $('#next-question-btn').on('click', function() {
        if (!session.paused) {
            $('#alert').text('Here you go.');
            session.incorrectAnswers++;
            timeoutAnswer();
        }
    });

    $('#restart-btn').on('click', function() {
        $('#game').fadeOut(fadeTime, function() {
            $('#answer-input').removeClass('d-none');
            $('#submit-btn, #next-question-btn').removeClass('d-none');
            $('#restart-btn').addClass('d-none');
            $('#time').removeClass('d-none');
            $('#correct, #incorrect').text(0);
            $('#categories').fadeIn(fadeTime);
        });
    });
}())