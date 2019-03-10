# Obsługiwane wiadomości

| Efekt                                    |                         Musi zawierać                          | Przykład                                                       | Uwagi                                                 |
| ---------------------------------------- | :------------------------------------------------------------: | -------------------------------------------------------------- | ----------------------------------------------------- |
| Uruchomienie procesu konfiguracji        |                **konfiguruj**, **skonfiguruj**                 | *Skonfiguruj*                                                  | konfiguracja trwa aż użytkownik poda poprawną grupę   |
| Wyświetlanie aktualnych zajęć            |                  **co mamy**, **gdzie mamy**                   | *Gdzie mamy?*                                                  |
| Wyświetlanie czasu do najbliższych zajęć |                  **co mamy**, **gdzie mamy**                   | *Gdzie mamy?*                                                  | czas do zajęć < 1 godzina                             |
| Wyświetlanie późniejszych zajęć          | **następne**, **następnie**, **później**, **potem**, **zaraz** | *Co mamy potem?*                                               |
| Wyświetlanie planu                       |                            **plan**                            | *Mogę zobaczyć plan?*, *Pokaż plan*                            |
| Wyświetlanie planu na inny dzień         |              **co mamy (data)**, **plan (data)**               | *Co mamy 23 marca?*, *Co mamy jutro?*, *Pokaż plan 4 kwietnia* | najlepiej podawać nazwę miesiąca słownie np. 23 marca |



# Wysyłanie wiadomości do bota

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

# Wysyłanie wiadomości w imieniu bota

Proces wygląda podobnie tylko tym razem zapytanie wysyłane jest na adres `https://graph.facebook.com/v2.6/me/messages?access_token=<PAGE_ACCESS_TOKEN>`. Typ zawartości tak samo jak wcześniej `application/json`. Przykładowa zawartość `JSON`:

```json
{
  "recipient": {
    "id": "<RECIPIENT_ID>"
  },
  "message": {
    "text": "hello, world!"
  }
}
```

# Referencja

Więcej o możliwościach bota na [Facebook API](https://developers.facebook.com/docs/messenger-platform)

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
