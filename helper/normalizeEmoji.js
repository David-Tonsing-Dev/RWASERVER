function normalizeEmoji(emoji) {
  // Remove Unicode skin tone modifiers (U+1F3FB to U+1F3FF)
  return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
}

module.exports = normalizeEmoji;
