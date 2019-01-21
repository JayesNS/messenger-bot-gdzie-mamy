# Wysyłanie wiadomości

Wyślij zapytanie POST na adres `https://gdziemamy.jsthats.me/webhook`, o typie zawartości `application/json`, parametrem jest tekst w formacie `JSON` z danymi potrzebnymi do wysłania zawartości.

### Przykładowy JSON

```json
{
  "object": "page",
  "entry": [
    {
      "messaging": [
        {
          "sender": {
            "id": "<SENDER_ID>"
          },
          "message": {
            "text": "hello, world!"
          }
        }
      ]
    }
  ]
}
```

### Przykładowe zapytanie POST

```bash
curl -H "Content-Type: application/json" -X POST "https://gdziemamy.jsthats.me/webhook" -d '{"object":"page","entry": [{"messaging": [{"sender":{"id":"<SENDER_ID>"},"message":{"text":"hello, world!"}}]}]}'
```

# Odpalanie lokalnego środowiska (node.js)

Uruchom polecenie `npm install` w celu pobrania zależności.

Następnie należy utworzyć plik z tokenem potrzebnym do połączenia z Facebook API. Access token dostępny jest za pośrednictwem Facebook API. Utwórz o nazwie `page-access-token.js` w katalogu w którym znajduje się `app.js`. Zawartość pliku powinna wyglądać następująco:

```javascript
module.exports = {
  token: '<PAGE_ACCESS_TOKEN>'
};
```

Gdy jesteś w katalogu z plikiem `app.js` uruchom polecenie `node app.js` lub `nodemon app.js`

### Wysyłanie wiadomości przez lokalne środowisko

Wysyłanie przebiega analogicznie do wysyłania przez serwer główny. Różnicą jest adres, który lokalnie ma postać `localhost:1337/webhook`
