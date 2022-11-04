const getUserByEmail = (emailReg, database) => {

  for (const user in database) {

    if (emailReg === database[user].email) {

      return database[user];
    }
  }
};

const generateRandomString = () => {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 1; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = (id, urlDatabase) => {
  const match = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      match[urlId] = urlDatabase[urlId].longURL;
    }
  }
  return match;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };