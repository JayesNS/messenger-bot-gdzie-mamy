import * as request from 'request';
import * as xml2json from 'xml2json';

export namespace Helpers {
  export function makeRequest(options: {
    uri?: string;
    qs?: any;
    method?: 'POST' | 'GET';
    json?: any;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      request(options, (error, response, data) => {
        if (error || response.statusCode !== 200) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  export function convertXmlToJsonString(rawXML: string): string {
    return xml2json.toJson(rawXML);
  }

  export function parse<T>(data: any): T {
    const parsedData: T = JSON.parse(data);
    return parsedData;
  }
}
