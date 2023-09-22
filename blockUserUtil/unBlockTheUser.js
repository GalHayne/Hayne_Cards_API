const unBlockTheuser= (user) => {
    user.wrongAttempts = [];
    user.blockedUser = false;
    user.save();
    
}

exports.unBlockTheuser = unBlockTheuser;
