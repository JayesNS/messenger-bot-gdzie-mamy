import app from './App';

const port = process.env.PORT || 3000;

app.listen(port, error => {
  if (error) {
    return console.log({ error });
  }

  return console.log(`Server is listening on ${port}`);
});
