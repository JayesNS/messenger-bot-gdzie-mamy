const returnNullIfObjectEmpty = object => {
  return typeof object === 'object' && Object.keys(object).length === 0 ? null : object;
};

module.exports = returnNullIfObjectEmpty;
