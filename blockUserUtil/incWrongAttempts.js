const incWrongAttempts = (user) => {
    user.wrongAttempts.push(new Date());
        if (user.wrongAttempts.length === 3){
          user.blockedUser = true;
          user.save();
          return true;
        }
    user.save();
    return false;
}


exports.incWrongAttempts = incWrongAttempts;
