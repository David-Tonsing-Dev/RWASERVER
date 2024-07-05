function capitalizeAfterSpace(text) {
  let words = text.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 0) {
      words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }
  }

  return words.join(" ");
}

module.exports = { capitalizeAfterSpace };
