const getUserByEmail = (emailReg, database) => {

  for (const user in database) {

    if (emailReg === database[user].email) {

      return database[user];
    }
  }
};



module.exports = { getUserByEmail };